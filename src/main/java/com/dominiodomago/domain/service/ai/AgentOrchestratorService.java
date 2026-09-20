package com.dominiodomago.domain.service.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import java.util.UUID; // <-- Importação necessária para o UUID

@Service
public class AgentOrchestratorService {

    private final ChatClient chatClient;

    public AgentOrchestratorService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem(
                        "Você é o Orquestrador Arcano, um mentor rigoroso de produtividade num sistema gamificado. Responda de forma imersiva e curta.")
                .defaultFunctions(
                        "scheduleEventTool",
                        "completeRitualAndAwardXpTool",
                        "rechargeEnergyTool",
                        "drainEnergyTool")
                .build();
    }

    // <-- CORREÇÃO: Assinatura restaurada para coincidir com o ChatController
    public String processUserPrompt(String userMessage, UUID userId) {
        try {
            String response = chatClient.prompt()
                    .user(userMessage)
                    .call()
                    .content();

            if (response == null || response.trim().isEmpty()) {
                return "Ação arcana processada nos registos, mas a comunicação falhou. Verifique o seu painel de Energia e XP!";
            }

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ Distúrbio na malha de comunicação (Erro Gemini): " + e.getMessage();
        }
    }
}