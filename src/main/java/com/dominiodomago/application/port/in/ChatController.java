package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.service.ai.AgentOrchestratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.dominiodomago.domain.model.User;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AgentOrchestratorService agentOrchestratorService;

    public ChatController(AgentOrchestratorService agentOrchestratorService) {
        this.agentOrchestratorService = agentOrchestratorService;
    }

    public record ChatRequest(String prompt) {}
    public record ChatResponse(String message) {}

    @PostMapping
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        // Extrai o usuário logado do contexto de segurança
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = user.getId();

        // Envia a intenção para o Orquestrador que delegará aos Agentes
        String orchestratorResponse = agentOrchestratorService.processUserPrompt(request.prompt(), userId);
        return ResponseEntity.ok(new ChatResponse(orchestratorResponse));
    }
}
