package com.dominiodomago.infrastructure.web.dto;

import com.dominiodomago.domain.model.StreakResult;
import java.math.BigDecimal;

public record StreakResponseDTO(
    int currentStreak,
    BigDecimal xpMultiplier,
    boolean streakBroken,
    boolean shieldUsed,
    int remainingShields
) {
    public static StreakResponseDTO from(StreakResult result) {
        return new StreakResponseDTO(
            result.currentStreak(),
            result.xpMultiplier(),
            result.streakBroken(),
            result.shieldUsed(),
            result.remainingShields()
        );
    }
}
