package com.dominiodomago.infrastructure.ai;

import com.dominiodomago.domain.service.DailyAstroStateService;
import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.domain.service.PranaService;
import com.dominiodomago.domain.service.ScoringEngineService;
import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.AreaEntity;
import com.dominiodomago.infrastructure.persistence.entity.DailyAstroStateEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.ActionRepository;
import com.dominiodomago.infrastructure.persistence.repository.AreaRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CanonicalToolsConfigTest {

    @Mock
    private ActionRepository actionRepository;

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private PranaService pranaService;

    @Mock
    private ScoringEngineService scoringEngineService;

    @Mock
    private DailyAstroStateService astroStateService;

    @Mock
    private GamificationEngineService gamificationEngineService;

    private CanonicalToolsConfig toolsConfig;
    private UserEntity user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        toolsConfig = new CanonicalToolsConfig(
                actionRepository,
                areaRepository,
                userJpaRepository,
                pranaService,
                scoringEngineService,
                astroStateService,
                gamificationEngineService
        );

        userId = UUID.randomUUID();
        user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setId(userId);
        user.setPranaLevel(80);

        when(userJpaRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
    }

    @Test
    @DisplayName("create_draft_item: deve criar rascunho com valores padrão e salvar no banco")
    void shouldCreateDraftItemSuccessfully() {
        when(actionRepository.save(any(ActionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var tool = toolsConfig.createDraftItemTool();
        var request = new CanonicalToolsConfig.CreateDraftItemRequest(
                "Leitura de Grimório",
                "Estudar 3 capítulos",
                BigDecimal.valueOf(15.00),
                "RESTORATIVE"
        );

        var response = tool.apply(request);

        assertNotNull(response.itemId());
        assertEquals("Leitura de Grimório", response.title());
        assertEquals("RESTORATIVE", response.energyType());
        assertEquals("DRAFT_CREATED", response.status());
        verify(actionRepository, times(1)).save(any(ActionEntity.class));
    }

    @Test
    @DisplayName("classify_item: deve classificar e atualizar área e energia de item existente")
    void shouldClassifyItemSuccessfully() {
        ActionEntity existing = new ActionEntity("act-101", "Exercício Físico", BigDecimal.valueOf(10.00));
        when(actionRepository.findById("act-101")).thenReturn(Optional.of(existing));
        when(actionRepository.save(any(ActionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var tool = toolsConfig.classifyItemTool();
        var request = new CanonicalToolsConfig.ClassifyItemRequest(
                "act-101",
                "area-corpo",
                "RESTORATIVE",
                3,
                true,
                "DAILY"
        );

        var response = tool.apply(request);

        assertEquals("act-101", response.itemId());
        assertEquals("area-corpo", response.areaId());
        assertEquals("RESTORATIVE", response.taskEnergyType());
        verify(actionRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("complete_item: deve debitar/recuperar Prana, calcular score ADR-000 e marcar como concluído")
    void shouldCompleteItemSuccessfully() {
        ActionEntity action = new ActionEntity("act-202", "Meditação Profunda", BigDecimal.valueOf(20.00));
        action.setUserId(userId);
        action.setAreaId("area-espirito");
        action.setTaskEnergyType("RESTORATIVE");

        when(actionRepository.findById("act-202")).thenReturn(Optional.of(action));
        when(pranaService.processActionPrana(eq(userId), eq(action)))
                .thenReturn(new PranaService.PranaTransactionResult(userId, 80, 100, 20, false, "RESTORATIVE", "Prana recuperado"));

        ScoringEngineService.MultiAreaScoreDistribution scoreDist = new ScoringEngineService.MultiAreaScoreDistribution(
                BigDecimal.valueOf(20.00),
                BigDecimal.valueOf(120.00),
                0.3,
                1.5,
                6.0,
                1.0,
                1.0,
                Map.of("area-espirito", BigDecimal.valueOf(120.00)),
                Map.of("water", BigDecimal.valueOf(120.00))
        );

        when(scoringEngineService.calculateAndDistributeScore(eq(action), eq(user), anyLong(), anyLong(), anyInt(), anyList()))
                .thenReturn(scoreDist);

        var tool = toolsConfig.completeItemTool();
        var request = new CanonicalToolsConfig.CompleteItemRequest("act-202", 20L, 60L, 3, List.of());

        var response = tool.apply(request);

        assertEquals("act-202", response.itemId());
        assertEquals(BigDecimal.valueOf(120.00), response.finalScore());
        assertEquals(100, response.currentPrana());
        assertFalse(response.exhausted());
        assertTrue(action.getIsCompleted());
        assertNotNull(action.getLastCompletedAt());

        verify(actionRepository, times(1)).save(action);
        verify(gamificationEngineService, times(1)).calculateLevelUp(user);
    }

    @Test
    @DisplayName("complete_item: deve bloquear ação quando o Mago estiver exausto em tarefa neutra")
    void shouldBlockCompleteItemWhenExhaustedOnNeutralTask() {
        ActionEntity action = new ActionEntity("act-303", "Trabalho Pesado", BigDecimal.valueOf(10.00));
        action.setUserId(userId);
        action.setTaskEnergyType("NEUTRAL");

        when(actionRepository.findById("act-303")).thenReturn(Optional.of(action));
        // Simula exaustão total
        when(pranaService.processActionPrana(eq(userId), eq(action)))
                .thenReturn(new PranaService.PranaTransactionResult(userId, 0, 0, 0, true, "NEUTRAL", "EXAUSTÃO"));

        var tool = toolsConfig.completeItemTool();
        var request = new CanonicalToolsConfig.CompleteItemRequest("act-303", 10L, 10L, 1, List.of());

        var response = tool.apply(request);

        assertTrue(response.exhausted());
        assertEquals(BigDecimal.ZERO, response.finalScore());
        assertTrue(response.message().contains("EXAUSTÃO TOTAL"));
        verify(scoringEngineService, never()).calculateAndDistributeScore(any(), any(), anyLong(), anyLong(), anyInt(), anyList());
    }

    @Test
    @DisplayName("query_daily_list: deve retornar lista de ações com estado de Prana e fase cósmica")
    void shouldQueryDailyListSuccessfully() {
        when(pranaService.getPrana(userId)).thenReturn(85);
        when(pranaService.isExhausted(userId)).thenReturn(false);

        DailyAstroStateEntity astro = new DailyAstroStateEntity("2026-09-25", "FULL", "fire", "[]", BigDecimal.valueOf(1.25), "{}");
        when(astroStateService.getTodayState()).thenReturn(astro);

        ActionEntity act1 = new ActionEntity("act-1", "Hábito 1", BigDecimal.valueOf(10));
        ActionEntity act2 = new ActionEntity("act-2", "Hábito 2", BigDecimal.valueOf(15));
        when(actionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(act1, act2));

        var tool = toolsConfig.queryDailyListTool();
        var request = new CanonicalToolsConfig.QueryDailyListRequest("ALL");

        var response = tool.apply(request);

        assertEquals(85, response.pranaLevel());
        assertFalse(response.isExhausted());
        assertEquals("FULL", response.moonPhase());
        assertEquals("fire", response.moonSign());
        assertEquals(2, response.items().size());
        assertTrue(response.summary().contains("FULL"));
    }
}
