package com.dominiodomago.application.port.out;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface UserRepositoryPort {

    Optional<UserStreakData> findStreakDataById(UUID userId);

    /**
     * Persiste o resultado do cálculo de streak (streak, multiplicador, escudos
     * restantes e a data de última atividade = hoje).
     */
    void updateStreakState(UUID userId, int newStreak, BigDecimal xpMultiplier, int remainingShields);
}
