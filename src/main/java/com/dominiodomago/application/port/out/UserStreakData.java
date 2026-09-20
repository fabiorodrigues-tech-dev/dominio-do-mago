package com.dominiodomago.application.port.out;

import java.time.LocalDate;
import java.util.UUID;

public record UserStreakData(
    UUID userId,
    int currentStreak,
    LocalDate lastActivityDate,
    int elementalShields
) {}
