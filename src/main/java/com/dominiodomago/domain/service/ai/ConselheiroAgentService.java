package com.dominiodomago.domain.service.ai;

import com.dominiodomago.domain.service.tools.TimeBlockingService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ConselheiroAgentService {

    private final ChatClient chatClient;
    private final TimeBlockingService timeBlockingService;

    public ConselheiroAgentService(ChatClient.Builder chatClientBuilder, TimeBlockingService timeBlockingService) {
        this.timeBlockingService = timeBlockingService;
        // Inicializa o ChatClient com as Tools (Functions) de Tarefas, Calendário, Rituais e Penalidades habilitadas
        this.chatClient = chatClientBuilder
                .defaultSystem("Você é o Copiloto Temporal do usuário. Sua missão é combater a procrastinação e o TDAH ajudando-o a organizar a rotina. Sempre que o usuário pedir para anotar, criar ou listar tarefas, consultar/agendar eventos no calendário, completar rituais ou aplicar penalidades, use as ferramentas disponíveis.")
                .defaultFunctions("createTask", "listPendingTasks", "getAgendaTool", "scheduleEventTool", "completeRitualAndAwardXpTool", "applyPenaltyTool")
                .build();
    }

    /**
     * Processa a solicitação do usuário utilizando as ferramentas do Conselheiro.
     *
     * @param userMessage Mensagem original do usuário (ex: "Crie a tarefa Estudar Spring amanhã")
     * @param userId      UUID do usuário
     * @return A resposta em texto gerada pelo agente.
     */
    public String handleRequest(String userMessage, UUID userId) {
        String contextMessage = String.format("User ID: %s\nMensagem do usuário: %s", userId.toString(), userMessage);

        try {
            return chatClient.prompt()
                    .user(contextMessage)
                    .call()
                    .content();
        } catch (Exception e) {
            String lower = userMessage.toLowerCase();
            var user = timeBlockingService.resolveCurrentUser();

            if (lower.contains("agend") && (lower.contains("marc") || lower.contains("program") || lower.contains("para") || lower.contains("às") || lower.contains("as"))) {
                var start = timeBlockingService.parseDateTime(userMessage, java.time.LocalDate.now());
                var end = start.plusHours(1);
                var block = timeBlockingService.scheduleEvent(user, "Compromisso Arcano", start, end);
                var timeFmt = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
                var dateFmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                return String.format("🧙‍♂️ [Conselheiro Temporal]: Evento '%s' agendado com sucesso para %s, das %s às %s!",
                        block.getTitle(), block.getStartTime().format(dateFmt), block.getStartTime().format(timeFmt), block.getEndTime().format(timeFmt));
            }

            if (lower.contains("agenda") || lower.contains("compromisso") || lower.contains("evento") || lower.contains("dia")) {
                var date = timeBlockingService.parseDate(userMessage);
                return timeBlockingService.getUpcomingEvents(user, date);
            }

            return "O canal místico com o Gemini está instável no momento. Verifique a sua conexão ou a chave GEMINI_API_KEY no ficheiro .env.";
        }
    }
}
