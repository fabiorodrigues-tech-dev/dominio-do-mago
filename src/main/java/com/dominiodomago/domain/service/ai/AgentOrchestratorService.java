package com.dominiodomago.domain.service.ai;

import com.dominiodomago.domain.service.tools.TaskXpToolService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AgentOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(AgentOrchestratorService.class);

    private final ChatClient chatClient;
    private final ConselheiroAgentService conselheiroAgentService;
    private final NutricaoAgent nutricaoAgent;
    private final EstudosAgent estudosAgent;
    private final TaskXpToolService taskXpToolService;
    private final com.dominiodomago.domain.service.tools.TimeBlockingService timeBlockingService;
    private final com.dominiodomago.domain.service.GamificationEngineService gamificationEngineService;

    public AgentOrchestratorService(ChatClient.Builder chatClientBuilder,
                                    ConselheiroAgentService conselheiroAgentService,
                                    NutricaoAgent nutricaoAgent,
                                    EstudosAgent estudosAgent,
                                    TaskXpToolService taskXpToolService,
                                    com.dominiodomago.domain.service.tools.TimeBlockingService timeBlockingService,
                                    com.dominiodomago.domain.service.GamificationEngineService gamificationEngineService) {
        this.conselheiroAgentService = conselheiroAgentService;
        this.nutricaoAgent = nutricaoAgent;
        this.estudosAgent = estudosAgent;
        this.taskXpToolService = taskXpToolService;
        this.timeBlockingService = timeBlockingService;
        this.gamificationEngineService = gamificationEngineService;

        // Inicializa o ChatClient com as tools de Calendário, Rituais/XP, Penalidades/HP, Tarefas e Energia
        this.chatClient = chatClientBuilder
                .defaultSystem("Você é o Orquestrador Arcano do Domínio do Mago. Você tem acesso à agenda do Mago, pode registrar tarefas e rituais, conceder XP elemental (Fogo, Água, Terra, Ar) e aplicar penalidades de HP. Você também gerencia a Energia (Stamina) do Mago. Lembre-se: missões pesadas de XP gastam energia, exigindo que o Mago descanse. Sempre que o Mago relatar ações de desgaste (ex: scroll em telas, má alimentação, dormir mal, excesso de esforço), use drainEnergyTool para remover energia. Se ele relatar ações de recarga (ex: dormir bem, meditar, alimentação saudável), use rechargeEnergyTool. Sempre que o Mago relatar procrastinação, preguiça, quebra de compromisso, falha num ritual ou desvio de foco, use a ferramenta applyPenaltyTool para deduzir HP e adverti-lo com sabedoria rígida. Sempre que o Mago informar que concluiu um treino, estudo, hábito ou ritual, ou pedir para adicionar um ritual feito hoje com XP em determinado elemento, use a ferramenta completeRitualAndAwardXpTool. Para consultar compromissos na agenda, use getAgendaTool (parâmetro date, ex: hoje). Para agendar compromissos ou rituais na agenda, use scheduleEventTool (parâmetros: title, startTime e endTime no formato YYYY-MM-DDTHH:mm:ss ou hora HH:mm). Você também pode criar tarefas (createTask) ou listar tarefas pendentes (listPendingTasks).")
                .defaultFunctions("getAgendaTool", "scheduleEventTool", "completeRitualAndAwardXpTool", "applyPenaltyTool", "createTask", "listPendingTasks", "rechargeEnergyTool", "drainEnergyTool")
                .build();
    }

    /**
     * Roteador Principal: Analisa a intenção do usuário e orquestra a resposta com Tools (Function Calling real via Gemini).
     *
     * @param userInput O texto digitado pelo usuário.
     * @param userId    O ID do usuário para contexto.
     * @return A resposta compilada com execução autônoma de ferramentas.
     */
    public String processUserPrompt(String userInput, UUID userId) {
        String lower = userInput.toLowerCase();

        // Processamento direto pelo Orquestrador com Function Calling ativo (Spring AI)
        try {
            log.info("🧙‍♂️ [Orquestrador] Enviando prompt para Gemini com Function Calling ativo para usuário {}: {}", userId, userInput);
            return chatClient.prompt()
                    .user(String.format("User ID: %s\nMensagem do Mago: %s", userId, userInput))
                    .call()
                    .content();
        } catch (Exception e) {
            log.warn("Falha na chamada generativa com Gemini ({}), ativando orquestração inteligente local.", e.getMessage());

            // Detecção determinística de intenção de Penalidade / Procrastinação
            if (isPenaltyIntent(lower)) {
                return executeDeterministicPenalty(userInput);
            }

            // Detecção determinística de intenção de Ritual & XP
            if (isRitualXpIntent(lower)) {
                return executeDeterministicRitual(userInput);
            }

            // Detecção determinística de intenção de Agenda / Time Blocking
            if (isAgendaIntent(lower)) {
                return executeDeterministicAgenda(userInput);
            }

            return conselheiroAgentService.handleRequest(userInput, userId);
        }
    }

    private boolean isAgendaIntent(String lower) {
        return lower.contains("agend") || lower.contains("compromisso") || lower.contains("horário")
                || lower.contains("horario") || lower.contains("calendár")
                || lower.contains("calendari") || lower.contains("marcar");
    }

    private String executeDeterministicAgenda(String userInput) {
        String lower = userInput.toLowerCase();
        var user = timeBlockingService.resolveCurrentUser();

        boolean isQuery = lower.contains("o que") || lower.contains("quais") || lower.contains("consult")
                || lower.contains("ver") || lower.contains("listar") || lower.contains("tenho")
                || lower.contains("como está") || lower.contains("como esta")
                || (lower.contains("agenda") && !lower.contains("agende") && !lower.contains("agendar"));

        // Se NÃO for consulta e tiver intenção de agendamento:
        if (!isQuery && (lower.contains("agend") || lower.contains("marc") || lower.contains("program") || lower.contains("adicionar"))) {
            var today = java.time.LocalDate.now();
            var start = timeBlockingService.parseDateTime(userInput, today);
            var end = start.plusHours(1);

            String title = "Ritual Arcano";
            String extracted = userInput
                    .replaceAll("(?i)\\b(agende|agendar|marcar|marque|programar|adicione|adicionar|para|mim|hoje|amanhã|amanha|um|uma|novo|nova)\\b", " ")
                    .replaceAll("(?i)\\b[aà]s\\b|[aà]s\\s+", " ")
                    .replaceAll("\\d{1,2}:\\d{2}", " ")
                    .replaceAll("\\s+", " ")
                    .trim();

            if (!extracted.isBlank() && extracted.length() >= 3) {
                title = extracted;
            } else if (lower.contains("treino")) {
                title = "Treino de Foco";
            } else if (lower.contains("estudo") || lower.contains("leitura")) {
                title = "Estudo Arcano";
            } else if (lower.contains("reunião") || lower.contains("reuniao")) {
                title = "Reunião";
            } else if (lower.contains("medita")) {
                title = "Meditação e Centramento";
            }

            var block = timeBlockingService.scheduleEvent(user, title, start, end);
            var timeFmt = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            var dateFmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");

            return String.format("⚡ [Agenda Arcana]: Compromisso '%s' forjado na linha do tempo para %s, das %s às %s!",
                    block.getTitle(),
                    block.getStartTime().format(dateFmt),
                    block.getStartTime().format(timeFmt),
                    block.getEndTime().format(timeFmt));
        }

        // Caso contrário, consulta da agenda
        var date = timeBlockingService.parseDate(userInput);
        return timeBlockingService.getUpcomingEvents(user, date);
    }

    private boolean isRitualXpIntent(String lower) {
        return (lower.contains("ritual") || lower.contains("treino") || lower.contains("estudo") || lower.contains("medita"))
                && (lower.contains("xp") || lower.contains("conclu") || lower.contains("adicione") || lower.contains("feitiço"));
    }

    private String executeDeterministicRitual(String userInput) {
        String lower = userInput.toLowerCase();

        // 1. Extração do Elemento
        String element = "Fogo";
        if (lower.contains("agua") || lower.contains("água") || lower.contains("fluidez") || lower.contains("emocional")) {
            element = "Água";
        } else if (lower.contains("terra") || lower.contains("rotina") || lower.contains("finan")) {
            element = "Terra";
        } else if (lower.contains("ar") || lower.contains("estudo") || lower.contains("intelect") || lower.contains("leitura")) {
            element = "Ar";
        }

        // 2. Extração do Valor de XP
        int xp = 50;
        Pattern pattern = Pattern.compile("(\\d+)\\s*(?:xp|pontos)?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(userInput);
        if (matcher.find()) {
            try {
                xp = Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        // 3. Extração do Título
        String title = "Ritual de " + element;
        if (lower.contains("treino")) {
            title = "Treino de Foco Arcano";
        } else if (lower.contains("medita")) {
            title = "Meditação e Fluidez Mental";
        } else if (lower.contains("estudo") || lower.contains("leitura")) {
            title = "Grimório de Estudos Arcanos";
        } else if (lower.contains("finan") || lower.contains("rotina")) {
            title = "Organização Material e Rotina";
        }

        return taskXpToolService.completeRitualAndAwardXp(title, element, xp);
    }

    private boolean isPenaltyIntent(String lower) {
        return lower.contains("procrastin") || lower.contains("falhei") || lower.contains("desviei")
                || lower.contains("perdi o foco") || lower.contains("não fiz") || lower.contains("nao fiz")
                || lower.contains("atrasei") || lower.contains("deixei de fazer") || lower.contains("não cumpri")
                || lower.contains("nao cumpri");
    }

    private String executeDeterministicPenalty(String userInput) {
        var user = timeBlockingService.resolveCurrentUser();
        int damage = 15;
        if (userInput.toLowerCase().contains("session") || userInput.toLowerCase().contains("ritual") || userInput.toLowerCase().contains("importante")) {
            damage = 20;
        }

        gamificationEngineService.deductHp(user, damage);

        return String.format(
                "⚠️ [Consequência Arcana]: A procrastinação quebrou a integridade do seu fluxo vital! Você sofreu -%d de HP por falhar no compromisso. HP Atual: %d/100. Um verdadeiro Mago não vacila diante de seus compromissos. Recupere a postura e honre sua jornada arcana!",
                damage, user.getHp()
        );
    }
}
