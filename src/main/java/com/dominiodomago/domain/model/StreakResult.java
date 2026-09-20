package com.dominiodomago.domain.model;

import java.math.BigDecimal;

public record StreakResult(
    int currentStreak,
    BigDecimal xpMultiplier,
    boolean streakBroken,
    boolean shieldUsed,
    int remainingShields
) {}
