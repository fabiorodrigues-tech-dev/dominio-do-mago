package com.dominiodomago.domain.service;

import static org.junit.jupiter.api.Assertions.*;

import com.dominiodomago.domain.model.StreakResult;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StreakDomainServiceTest {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final LocalDate TODAY = LocalDate.of(2026, 9, 20);

    private StreakDomainService streakDomainService;

    @BeforeEach
    void setUp() {
        Clock fixedClock = Clock.fixed(TODAY.atStartOfDay(ZONE).toInstant(), ZONE);
        streakDomainService = new StreakDomainService(fixedClock);
    }

    @Test
    @DisplayName("Primeira atividade (sem histórico) deve iniciar streak em 1")
    void shouldStartStreakAtOneWhenNoHistory() {
        StreakResult result = streakDomainService.calculateStreak(0, null, 1);

        assertEquals(1, result.currentStreak());
        assertFalse(result.streakBroken());
        assertFalse(result.shieldUsed());
    }

    @Test
    @DisplayName("Atividade no dia seguinte deve incrementar a ofensiva")
    void shouldIncrementStreakOnConsecutiveDay() {
        StreakResult result = streakDomainService.calculateStreak(5, TODAY.minusDays(1), 1);

        assertEquals(6, result.currentStreak());
        assertFalse(result.streakBroken());
        assertFalse(result.shieldUsed());
    }

    @Test
    @DisplayName("Perdão TDAH: falhar 1 dia com escudo disponível mantém a ofensiva e gasta o escudo")
    void shouldUseShieldWhenOneDayMissedAndShieldAvailable() {
        StreakResult result = streakDomainService.calculateStreak(5, TODAY.minusDays(2), 1);

        assertEquals(5, result.currentStreak());
        assertTrue(result.shieldUsed());
        assertFalse(result.streakBroken());
        assertEquals(0, result.remainingShields());
    }

    @Test
    @DisplayName("Falhar 1 dia sem escudo disponível quebra a ofensiva")
    void shouldBreakStreakWhenOneDayMissedAndNoShield() {
        StreakResult result = streakDomainService.calculateStreak(5, TODAY.minusDays(2), 0);

        assertEquals(1, result.currentStreak());
        assertTrue(result.streakBroken());
        assertFalse(result.shieldUsed());
    }

    @Test
    @DisplayName("Falhar vários dias sempre quebra a ofensiva, mesmo com escudos")
    void shouldBreakStreakWhenManyDaysMissed() {
        StreakResult result = streakDomainService.calculateStreak(10, TODAY.minusDays(5), 2);

        assertEquals(1, result.currentStreak());
        assertTrue(result.streakBroken());
        assertEquals(0, result.remainingShields());
    }

    @Test
    @DisplayName("Multiplicador de XP nunca deve ultrapassar 2.0x")
    void shouldCapXpMultiplierAtTwo() {
        StreakResult result = streakDomainService.calculateStreak(200, TODAY.minusDays(1), 1);

        assertEquals(0, result.xpMultiplier().compareTo(java.math.BigDecimal.valueOf(2.00)));
    }
}
