package com.dominiodomago.infrastructure.ai;

import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.domain.service.tools.TimeBlockingService;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.function.Function;

@Configuration
public class EnergyToolConfig {

    public record EnergyRequest(String reason, Integer amount) {}
    public record EnergyResponse(String result) {}

    @Bean
    @Description("Adiciona energia (stamina) ao Mago quando ele realizar ações positivas de recuperação (ex: dormir bem, meditar, boa alimentação, hidratação). Adiciona de +10 a +100 dependendo da ação.")
    public Function<EnergyRequest, EnergyResponse> rechargeEnergyTool(
            GamificationEngineService gamificationEngineService,
            TimeBlockingService timeBlockingService) {
        return request -> {
            UserEntity user = timeBlockingService.resolveCurrentUser();
            if (user == null) {
                return new EnergyResponse("Erro: Mago não identificado no plano astral.");
            }

            int amount = (request != null && request.amount() != null && request.amount() > 0)
                    ? request.amount()
                    : 20;

            String reason = (request != null && request.reason() != null && !request.reason().isBlank())
                    ? request.reason()
                    : "descanso arcano";

            gamificationEngineService.modifyEnergy(user, amount);

            String message = String.format(
                    "⚡ [Energia Restaurada]: A ação '%s' revigorou sua essência! Você recuperou +%d de Energia. Energia Atual: %d/100. Excelente trabalho, Mago!",
                    reason, amount, user.getEnergy()
            );

            return new EnergyResponse(message);
        };
    }

    @Bean
    @Description("Remove energia (stamina) do Mago quando ele realizar ações de desgaste (ex: scroll infinito, má alimentação, dormir mal, álcool). Remove de -15 a -40 dependendo da ação.")
    public Function<EnergyRequest, EnergyResponse> drainEnergyTool(
            GamificationEngineService gamificationEngineService,
            TimeBlockingService timeBlockingService) {
        return request -> {
            UserEntity user = timeBlockingService.resolveCurrentUser();
            if (user == null) {
                return new EnergyResponse("Erro: Mago não identificado no plano astral.");
            }

            int amount = (request != null && request.amount() != null && request.amount() > 0)
                    ? request.amount()
                    : 15;

            // Make sure amount is negative for draining
            amount = -Math.abs(amount);

            String reason = (request != null && request.reason() != null && !request.reason().isBlank())
                    ? request.reason()
                    : "desgaste mundano";

            gamificationEngineService.modifyEnergy(user, amount);

            String message = String.format(
                    "🔋 [Energia Drenada]: A ação '%s' sugou sua vitalidade! Você perdeu %d de Energia. Energia Atual: %d/100. Cuidado para não esgotar sua stamina!",
                    reason, amount, user.getEnergy()
            );

            return new EnergyResponse(message);
        };
    }
}
