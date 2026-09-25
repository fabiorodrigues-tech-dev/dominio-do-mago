package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.AreaEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.AreaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScoringEngineServiceTest {

    @Mock
    private DailyAstroStateService astroStateService;

    @Mock
    private AreaRepository areaRepository;

    private ScoringEngineService scoringEngineService;
    private UserEntity user;

    @BeforeEach
    void setUp() {
        scoringEngineService = new ScoringEngineService(astroStateService, areaRepository);
        user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setId(UUID.randomUUID());
        user.setPranaLevel(70);
    }

    @Test
    @DisplayName("Presence Bonus: deve seguir os degraus determinísticos de tempo real (<30s, 30-59s, 60-119s, >=120s)")
    void shouldCalculatePresenceBonusCorrectly() {
        assertEquals(0.0, scoringEngineService.calculatePresenceBonus(10));
        assertEquals(0.0, scoringEngineService.calculatePresenceBonus(29));
        assertEquals(0.1, scoringEngineService.calculatePresenceBonus(30));
        assertEquals(0.1, scoringEngineService.calculatePresenceBonus(59));
        assertEquals(0.3, scoringEngineService.calculatePresenceBonus(60));
        assertEquals(0.3, scoringEngineService.calculatePresenceBonus(119));
        assertEquals(0.5, scoringEngineService.calculatePresenceBonus(120));
        assertEquals(0.5, scoringEngineService.calculatePresenceBonus(300));
    }

    @Test
    @DisplayName("Effort Multiplier: deve seguir os níveis de 1 a 5 (1.0, 1.2, 1.5, 2.0, 2.8)")
    void shouldCalculateEffortMultiplierCorrectly() {
        assertEquals(1.0, scoringEngineService.calculateEffortMultiplier(1));
        assertEquals(1.2, scoringEngineService.calculateEffortMultiplier(2));
        assertEquals(1.5, scoringEngineService.calculateEffortMultiplier(3));
        assertEquals(2.0, scoringEngineService.calculateEffortMultiplier(4));
        assertEquals(2.8, scoringEngineService.calculateEffortMultiplier(5));
        assertEquals(1.0, scoringEngineService.calculateEffortMultiplier(0)); // fallback
    }

    @Test
    @DisplayName("Curva Agressiva de Tempo: deve aplicar os multiplicadores canônicos por faixa de minutos")
    void shouldApplyAggressiveTimeCurveCorrectly() {
        assertEquals(1.0, scoringEngineService.calculateAggressiveTimeMultiplier(4));   // < 5min
        assertEquals(2.0, scoringEngineService.calculateAggressiveTimeMultiplier(5));   // 5-15min
        assertEquals(2.0, scoringEngineService.calculateAggressiveTimeMultiplier(15));  // 5-15min
        assertEquals(6.0, scoringEngineService.calculateAggressiveTimeMultiplier(25));  // 16-30min
        assertEquals(15.0, scoringEngineService.calculateAggressiveTimeMultiplier(45)); // 31-60min
        assertEquals(30.0, scoringEngineService.calculateAggressiveTimeMultiplier(75)); // 61-90min
        assertEquals(50.0, scoringEngineService.calculateAggressiveTimeMultiplier(100));// 91-120min
        assertEquals(80.0, scoringEngineService.calculateAggressiveTimeMultiplier(130));// > 120min
    }

    @Test
    @DisplayName("Pipeline Canônico ADR-000: calcula pontuação completa e divide 100/60/30 sem multiplicador de streak")
    void shouldCalculateFullPipelineAndDistribute100_60_30() {
        // Base = 10.00
        ActionEntity action = new ActionEntity("act-1", "Sessão Focada de Estudo", BigDecimal.valueOf(10.00));
        when(astroStateService.getElementModifier("air")).thenReturn(BigDecimal.valueOf(1.00));

        AreaEntity area1 = new AreaEntity("area-mente", "Mente Arcana", "body-air", "#3B82F6", true);
        AreaEntity area2 = new AreaEntity("area-corpo", "Templo do Corpo", "body-fire", "#EF4444", false);
        AreaEntity area3 = new AreaEntity("area-espirito", "Equilíbrio Interior", "body-water", "#10B981", false);

        when(areaRepository.findById("area-mente")).thenReturn(Optional.of(area1));
        when(areaRepository.findById("area-corpo")).thenReturn(Optional.of(area2));
        when(areaRepository.findById("area-espirito")).thenReturn(Optional.of(area3));

        List<String> areas = List.of("area-mente", "area-corpo", "area-espirito");

        // Parametros:
        // durationMinutes = 20 (faixa 16-30min -> M_time = 6.0)
        // presenceSeconds = 45 (faixa 30-59s -> presence_bonus = 0.1 -> factor = 1.1)
        // effortLevel = 3 (M_effort = 1.5)
        // astro = 1.0, exhaustion = 1.0 (prana = 70)
        // Esperado: 10.00 * 1.1 * 1.5 * 6.0 * 1.0 * 1.0 = 99.00
        var result = scoringEngineService.calculateAndDistributeScore(action, user, 20, 45, 3, areas);

        assertEquals(BigDecimal.valueOf(99.00).setScale(2), result.finalScore());
        assertEquals(0.1, result.presenceBonus());
        assertEquals(1.5, result.effortMultiplier());
        assertEquals(6.0, result.timeMultiplier());
        assertEquals(1.0, result.astroMultiplier());
        assertEquals(1.0, result.exhaustionMultiplier());

        // Distribuição Multi-Área 100/60/30:
        // Primária: 99.00 * 1.00 = 99.00
        // Secundária: 99.00 * 0.60 = 59.40
        // Terciária: 99.00 * 0.30 = 29.70
        assertEquals(BigDecimal.valueOf(99.00).setScale(2), result.areaDistribution().get("area-mente"));
        assertEquals(BigDecimal.valueOf(59.40).setScale(2), result.areaDistribution().get("area-corpo"));
        assertEquals(BigDecimal.valueOf(29.70).setScale(2), result.areaDistribution().get("area-espirito"));

        assertEquals(BigDecimal.valueOf(99.00).setScale(2), result.elementDistribution().get("air"));
        assertEquals(BigDecimal.valueOf(59.40).setScale(2), result.elementDistribution().get("fire"));
        assertEquals(BigDecimal.valueOf(29.70).setScale(2), result.elementDistribution().get("water"));
    }

    @Test
    @DisplayName("Exhaustion: deve aplicar multiplicador de 0.5 quando prana <= 0")
    void shouldApplyExhaustionMultiplierWhenPranaZeroOrNegative() {
        user.setPranaLevel(0); // Exaustão Arcana
        ActionEntity action = new ActionEntity("act-2", "Ritual Exaustivo", BigDecimal.valueOf(10.00));
        when(astroStateService.getElementModifier(anyString())).thenReturn(BigDecimal.valueOf(1.00));

        // duration = 4min (<5min -> x1.0), presence = 10s (bonus 0 -> factor 1.0), effort = 1 (x1.0)
        // 10.00 * 1.0 * 1.0 * 1.0 * 1.0 * 0.5 (exhaustion) = 5.00
        var result = scoringEngineService.calculateAndDistributeScore(action, user, 4, 10, 1, List.of("area-sem-categoria"));

        assertEquals(BigDecimal.valueOf(5.00).setScale(2), result.finalScore());
        assertEquals(0.5, result.exhaustionMultiplier());
    }

    @Test
    @DisplayName("Astro Modifier: deve aplicar modificador astrológico do elemento da área primária")
    void shouldApplyAstroModifierForPrimaryArea() {
        user.setPranaLevel(100);
        ActionEntity action = new ActionEntity("act-3", "Treino de Fogo", BigDecimal.valueOf(10.00));
        AreaEntity fireArea = new AreaEntity("area-fogo", "Fogo Vivo", "body-fire", "#EF4444", true);

        when(areaRepository.findById("area-fogo")).thenReturn(Optional.of(fireArea));
        // Lua em Fogo potencializa elemento fogo para 1.25x
        when(astroStateService.getElementModifier("fire")).thenReturn(BigDecimal.valueOf(1.25));

        // Base 10 * factor 1.0 * effort 1.0 * time 1.0 * astro 1.25 * exhaustion 1.0 = 12.50
        var result = scoringEngineService.calculateAndDistributeScore(action, user, 4, 10, 1, List.of("area-fogo"));

        assertEquals(BigDecimal.valueOf(12.50).setScale(2), result.finalScore());
        assertEquals(1.25, result.astroMultiplier());
    }
}
