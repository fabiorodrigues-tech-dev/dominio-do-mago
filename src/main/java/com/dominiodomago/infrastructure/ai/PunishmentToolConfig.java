package com.dominiodomago.infrastructure.ai;

import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.domain.service.tools.TimeBlockingService;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.function.Function;

@Configuration
public class PunishmentToolConfig {

    public record PenaltyRequest(String reason, Integer damage) {}
    public record PenaltyResponse(String result) {}

    @Bean
    @Description("Deduz pontos de vida (HP) do Mago quando ele relatar procrastinação, falha num ritual ou desvio de foco.")
    public Function<PenaltyRequest, PenaltyResponse> applyPenaltyTool(
            GamificationEngineService gamificationEngineService,
            TimeBlockingService timeBlockingService) {
        return request -> {
            UserEntity user = timeBlockingService.resolveCurrentUser();
            if (user == null) {
                return new PenaltyResponse("Erro: Mago não identificado no plano astral.");
            }

            int damage = (request != null && request.damage() != null && request.damage() > 0)
                    ? request.damage()
                    : 15;

            String reason = (request != null && request.reason() != null && !request.reason().isBlank())
                    ? request.reason()
                    : "procrastinação ou desvio de foco";

            gamificationEngineService.deductHp(user, damage);

            String message = String.format(
                    "⚠️ [Consequência Arcana]: A procrastinação e o desvio de foco corroeram o seu Sopro Vital! Você sofreu -%d de HP devido a '%s'. HP Atual: %d/100. Lembre-se, Mago: o tempo não perdoa os hesitantes. Recupere sua postura e retome seus rituais imediatamente!",
                    damage, reason, user.getHp()
            );

            return new PenaltyResponse(message);
        };
    }
}
