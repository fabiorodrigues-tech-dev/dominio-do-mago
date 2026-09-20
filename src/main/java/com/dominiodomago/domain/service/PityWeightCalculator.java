package com.dominiodomago.domain.service;

import com.dominiodomago.domain.model.TaskSnapshot;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Implementa o "Gacha Evolutivo" (Pity System): tarefas negligenciadas
 * ganham peso com o tempo, forçando o sorteio a favorecê-las cada vez mais.
 *
 * peso_dinamico = peso_base * (1 + diasNegligenciada * growthPerDay), limitado a maxMultiplier.
 */
public class PityWeightCalculator {

    private final Clock clock;
    private final double growthPerDay;
    private final double maxMultiplier;

    public PityWeightCalculator(Clock clock, double growthPerDay, double maxMultiplier) {
        if (growthPerDay < 0) {
            throw new IllegalArgumentException("growthPerDay não pode ser negativo");
        }
        if (maxMultiplier < 1.0) {
            throw new IllegalArgumentException("maxMultiplier deve ser >= 1.0");
        }
        this.clock = clock;
        this.growthPerDay = growthPerDay;
        this.maxMultiplier = maxMultiplier;
    }

    /**
     * Calcula o peso dinâmico (arredondado para cima, mínimo 1) de uma tarefa
     * para uso direto em GachaAlgorithmService.TaskCandidate.
     */
    public int calculateDynamicWeight(TaskSnapshot task) {
        long daysNeglected = daysSinceLastCompletion(task.lastCompletedDate());
        double multiplier = Math.min(maxMultiplier, 1.0 + (daysNeglected * growthPerDay));
        double weighted = task.baseWeight() * multiplier;
        return (int) Math.max(1, Math.ceil(weighted));
    }

    private long daysSinceLastCompletion(LocalDate lastCompletedDate) {
        LocalDate today = LocalDate.now(clock);
        if (lastCompletedDate == null) {
            // Nunca foi feita: trata como fortemente negligenciada (30 dias de referência)
            return 30;
        }
        return Math.max(0, ChronoUnit.DAYS.between(lastCompletedDate, today));
    }
}
