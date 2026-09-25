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
        user.setXpMultiplier(BigDecimal.valueOf(1.00));
        user.setPranaLevel(70);
    }

    @Test
    @DisplayName("Curva Agressiva: pontual ou antecipado deve conceder bônus crescente")
    void shouldAwardBonusForEarlyOrOnTimeCompletion() {
        double onTime = scoringEngineService.calculateAggressiveTimeCurveMultiplier(0);
        double early15Min = scoringEngineService.calculateAggressiveTimeCurveMultiplier(-15);
        double early30Min = scoringEngineService.calculateAggressiveTimeCurveMultiplier(-30);

        assertEquals(1.00, onTime);
        assertTrue(early15Min > 1.00, "15 min antecipado deve ter bônus");
        assertTrue(early30Min > early15Min, "30 min antecipado deve ser maior que 15 min");
    }

    @Test
    @DisplayName("Curva Agressiva: atraso deve sofrer queda exponencial e atingir o piso mínimo")
    void shouldDecayAggressivelyWithDelay() {
        double mult15Min = scoringEngineService.calculateAggressiveTimeCurveMultiplier(15);
        double mult30Min = scoringEngineService.calculateAggressiveTimeCurveMultiplier(30);
        double mult60Min = scoringEngineService.calculateAggressiveTimeCurveMultiplier(60);
        double mult120Min = scoringEngineService.calculateAggressiveTimeCurveMultiplier(120);

        assertTrue(mult15Min < 1.00);
        assertTrue(mult30Min < mult15Min);
        assertTrue(mult60Min < mult30Min);
        assertEquals(0.15, mult120Min, 0.01, "Atraso longo deve respeitar o piso mínimo de 0.15");
    }

    @Test
    @DisplayName("ADR-000: Deve distribuir pontuação entre áreas na proporção canônica 100/60/30")
    void shouldDistributeMultiAreaScores100_60_30() {
        ActionEntity action = new ActionEntity("act-1", "Sessão de Estudos e Treino", BigDecimal.valueOf(100.00));
        when(astroStateService.getElementModifier(anyString())).thenReturn(BigDecimal.valueOf(1.00));

        AreaEntity area1 = new AreaEntity("area-mente", "Mente Arcana", "body-air", "#3B82F6", true);
        AreaEntity area2 = new AreaEntity("area-corpo", "Templo do Corpo", "body-fire", "#EF4444", false);
        AreaEntity area3 = new AreaEntity("area-espirito", "Equilíbrio Interior", "body-water", "#10B981", false);

        when(areaRepository.findById("area-mente")).thenReturn(Optional.of(area1));
        when(areaRepository.findById("area-corpo")).thenReturn(Optional.of(area2));
        when(areaRepository.findById("area-espirito")).thenReturn(Optional.of(area3));

        List<String> areas = List.of("area-mente", "area-corpo", "area-espirito");

        // Execução pontual (delay = 0 -> timeMultiplier = 1.00)
        var result = scoringEngineService.calculateAndDistributeScore(action, user, 0, areas);

        assertEquals(BigDecimal.valueOf(100.00).setScale(2), result.finalScore());

        // 100% para primária, 60% para secundária, 30% para terciária
        assertEquals(BigDecimal.valueOf(100.00).setScale(2), result.areaDistribution().get("area-mente"));
        assertEquals(BigDecimal.valueOf(60.00).setScale(2), result.areaDistribution().get("area-corpo"));
        assertEquals(BigDecimal.valueOf(30.00).setScale(2), result.areaDistribution().get("area-espirito"));

        // Elementos correspondentes também recebem a pontuação
        assertEquals(BigDecimal.valueOf(100.00).setScale(2), result.elementDistribution().get("air"));
        assertEquals(BigDecimal.valueOf(60.00).setScale(2), result.elementDistribution().get("fire"));
        assertEquals(BigDecimal.valueOf(30.00).setScale(2), result.elementDistribution().get("water"));
    }

    @Test
    @DisplayName("ADR-000: Deve aplicar debuff de exaustão quando o Mago estiver com Prana zerado")
    void shouldApplyExhaustionDebuffWhenPranaZero() {
        user.setPranaLevel(0); // Exaustão!
        ActionEntity action = new ActionEntity("act-2", "Trabalho Sob Pressão", BigDecimal.valueOf(100.00));
        when(astroStateService.getElementModifier(anyString())).thenReturn(BigDecimal.valueOf(1.00));

        var result = scoringEngineService.calculateAndDistributeScore(action, user, 0, List.of("area-sem-categoria"));

        // Base 100 * 1.00 (tempo) * 1.00 (astro) * 1.00 (streak) * 0.50 (debuff exaustão) = 50.00
        assertEquals(BigDecimal.valueOf(50.00).setScale(2), result.finalScore());
        assertEquals(0.50, result.pranaMultiplier());
    }

    @Test
    @DisplayName("ADR-000: Deve aplicar bônus de Flow State quando o Mago estiver com Prana >= 80")
    void shouldApplyFlowStateBonusWhenPranaHigh() {
        user.setPranaLevel(95); // Flow State!
        ActionEntity action = new ActionEntity("act-3", "Fluxo Perfeito", BigDecimal.valueOf(100.00));
        when(astroStateService.getElementModifier(anyString())).thenReturn(BigDecimal.valueOf(1.00));

        var result = scoringEngineService.calculateAndDistributeScore(action, user, 0, List.of("area-sem-categoria"));

        // Base 100 * 1.15 (flow state) = 115.00
        assertEquals(BigDecimal.valueOf(115.00).setScale(2), result.finalScore());
        assertEquals(1.15, result.pranaMultiplier());
    }
}
