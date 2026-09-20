package com.dominiodomago.domain.service;

import com.dominiodomago.domain.model.StreakResult;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class StreakDomainService {

    private final Clock clock; // Injeção do Clock para respeitar fuso horário

    public StreakDomainService(Clock clock) {
        this.clock = clock;
    }

    public StreakResult calculateStreak(int currentStreak, LocalDate lastActivityDate, int currentShields) {
        LocalDate today = LocalDate.now(clock);

        if (lastActivityDate == null) {
            return new StreakResult(1, BigDecimal.valueOf(1.03).setScale(2, RoundingMode.HALF_UP), false, false, currentShields);
        }

        long daysBetween = ChronoUnit.DAYS.between(lastActivityDate, today);
        int newStreak = currentStreak;
        boolean streakBroken = false;
        boolean shieldUsed = false;
        int remainingShields = currentShields;

        if (daysBetween == 1) {
            // Sucesso: Incrementa ofensiva
            newStreak = currentStreak + 1;
        } else if (daysBetween == 2 && currentShields > 0) {
            // Perdão TDAH: Faltou 1 dia, mas tem escudo. Mantém ofensiva, gasta escudo.
            shieldUsed = true;
            remainingShields--;
        } else if (daysBetween > 1) {
            // Falha Crítica: Sem escudos ou muitos dias perdidos. Reseta.
            newStreak = 1;
            streakBroken = true;
            remainingShields = 0; // Opcional: zera escudos ao quebrar
        }
        // daysBetween == 0 (segunda ação no mesmo dia): mantém streak/multiplicador atuais.

        // Limite máximo de 2.0x atingido com constância
        double multiplierValue = Math.min(2.0, 1.0 + (newStreak * 0.033));
        BigDecimal xpMultiplier = BigDecimal.valueOf(multiplierValue).setScale(2, RoundingMode.HALF_UP);

        return new StreakResult(newStreak, xpMultiplier, streakBroken, shieldUsed, remainingShields);
    }
}
