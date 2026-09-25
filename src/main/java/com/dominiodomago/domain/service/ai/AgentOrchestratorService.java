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
                // PROMPT BLINDADO: Impede a alucinação de ferramentas
                .defaultSystem(
                        "Você é o Orquestrador Arcano, um mentor rigoroso num sistema gamificado. Responda de forma imersiva e curta. REGRA ABSOLUTA: Se o utilizador pedir para agendar algo, DEVE OBRIGATORIAMENTE invocar a tool 'scheduleEventTool'. Nunca afirme que agendou ou concluiu algo sem executar a ferramenta real do sistema.")
                .defaultFunctions(
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