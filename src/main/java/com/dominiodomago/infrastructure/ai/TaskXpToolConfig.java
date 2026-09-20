package com.dominiodomago.infrastructure.ai;

import com.dominiodomago.domain.service.tools.TaskXpToolService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.function.Function;

@Configuration
public class TaskXpToolConfig {

    public record RitualRequest(String taskTitle, String element, Integer xpAmount) {}
    public record RitualResponse(String result) {}

    @Bean
    @Description("Completa um ritual, treino, estudo ou tarefa diária e concede XP ao elemento correspondente (Fogo, Água, Terra ou Ar) e à Aura do Mago.")
    public Function<RitualRequest, RitualResponse> completeRitualAndAwardXpTool(TaskXpToolService service) {
        return request -> {
            int xp = (request != null && request.xpAmount() != null && request.xpAmount() > 0) ? request.xpAmount() : 50;
            String elem = (request != null && request.element() != null && !request.element().isBlank()) ? request.element() : "Fogo";
            String title = (request != null && request.taskTitle() != null && !request.taskTitle().isBlank()) ? request.taskTitle() : "Ritual de Poder";
            String message = service.completeRitualAndAwardXp(title, elem, xp);
            return new RitualResponse(message);
        };
    }
}
