package com.dominiodomago.domain.service.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class AgentOrchestratorService {

    private final ChatClient chatClient;

    public AgentOrchestratorService(ChatClient.Builder chatClientBuilder) {
        // Inicializamos a memória interna do Spring AI
        InMemoryChatMemory chatMemory = new InMemoryChatMemory();

        this.chatClient = chatClientBuilder
                // PROMPT BLINDADO ANTI-ALUCINAÇÃO (04-Integracao-LLM-e-Voz.md)
                .defaultSystem(
                        "Você é o Orquestrador Arcano, o mentor supremo e guardião da disciplina no Domínio do Mago (Conselho Elemental v4.0). " +
                        "Responda sempre de forma épica, imersiva, concisa e focada no progresso do Mago.\n\n" +
                        "DIRETRIZES ABSOLUTAS ANTI-ALUCINAÇÃO:\n" +
                        "1. NUNCA afirme ou alucine que criou, classificou, concluiu ou agendou algo sem invocar a ferramenta real correspondente.\n" +
                        "2. Para capturar ou criar novos hábitos, tarefas ou rascunhos, DEVE OBRIGATORIAMENTE invocar 'create_draft_item'.\n" +
                        "3. Para definir área elemental (fogo, água, terra, ar) ou energia (RESTORATIVE, POISON, NEUTRAL), invoque 'classify_item'.\n" +
                        "4. Quando o Mago relatar a realização ou conclusão de qualquer ação, DEVE OBRIGATORIAMENTE invocar 'complete_item' para debitar/recuperar Prana e calcular a pontuação canônica ADR-000.\n" +
                        "5. Quando o Mago perguntar sobre o que tem para fazer, afazeres ou rotina do dia, DEVE OBRIGATORIAMENTE invocar 'query_daily_list'.\n" +
                        "6. Para agendamentos de blocos de tempo no quadro temporal, invoque 'scheduleEventTool'.\n" +
                        "7. Respeite com rigor a EXAUSTÃO ARCANA: caso o Prana chegue a 0, tarefas neutras e pesadas são bloqueadas até que rituais restauradores sejam executados.")
                .defaultFunctions(
                        "create_draft_item",
                        "classify_item",
                        "complete_item",
                        "query_daily_list",
                        "scheduleEventTool",
                        "completeRitualAndAwardXpTool",
                        "rechargeEnergyTool",
                        "drainEnergyTool")
                // ADICIONA O HISTÓRICO DE CONVERSAS (Advisors)
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
                .build();
    }

    public String processUserPrompt(String userPrompt, UUID userId) {
        try {
            String response = chatClient.prompt()
                    .user(userPrompt)
                    // Passamos o ID do utilizador para separar as memórias (caso tenha vários
                    // utilizadores no futuro)
                    .advisors(a -> a.param(MessageChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY, userId.toString()))
                    .call()
                    .content();

            if (response == null || response.trim().isEmpty()) {
                return "Ação arcana processada nos registos, mas a comunicação falhou. Verifique o seu painel!";
            }

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ Distúrbio na malha de comunicação (Erro Gemini): " + e.getMessage();
        }
    }
}