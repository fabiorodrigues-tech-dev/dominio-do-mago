package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.domain.service.PranaService;
import com.dominiodomago.domain.service.ScoringEngineService;
import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.ActionRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActionControllerTest {

    @Mock
    private ActionRepository actionRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private PranaService pranaService;

    @Mock
    private ScoringEngineService scoringEngineService;

    @Mock
    private GamificationEngineService gamificationEngineService;

    private ActionController controller;

    private UUID userId;
    private User domainUser;
    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        controller = new ActionController(
                actionRepository,
                userJpaRepository,
                pranaService,
                scoringEngineService,
                gamificationEngineService
        );

        userId = UUID.randomUUID();
        domainUser = new User();
        domainUser.setId(userId);
        domainUser.setUsername("mago");
        domainUser.setEmail("mago@reino.com");

        userEntity = new UserEntity("mago", "mago@reino.com", "hash");
        userEntity.setId(userId);
        userEntity.setPranaLevel(70);
        userEntity.setFireXp(50);
        userEntity.setWaterXp(50);
        userEntity.setEarthXp(50);
        userEntity.setAirXp(50);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(domainUser, null, List.of())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve listar ações do usuário logado ou semear se vazio")
    void shouldGetActionsOrSeed() {
        when(userJpaRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(actionRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());
        when(actionRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<List<ActionEntity>> response = controller.getActions();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotEmpty();
        verify(actionRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Deve criar nova ação/hábito com tipo de energia")
    void shouldCreateAction() {
        when(userJpaRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(actionRepository.save(any(ActionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var dto = new ActionController.CreateActionDto(
                "Meditação Diária",
                "Foco e relaxamento",
                "area-agua",
                "RESTORATIVE",
                BigDecimal.valueOf(25.0),
                true,
                "DAILY"
        );

        ResponseEntity<ActionEntity> response = controller.createAction(dto);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Meditação Diária");
        assertThat(response.getBody().getTaskEnergyType()).isEqualTo("RESTORATIVE");
        assertThat(response.getBody().getRecurrenceEnabled()).isTrue();
    }

    @Test
    @DisplayName("Deve concluir ação, debitar/recuperar prana e pontuar no ScoringEngine")
    void shouldCompleteActionSuccessfully() {
        when(userJpaRepository.findById(userId)).thenReturn(Optional.of(userEntity));

        ActionEntity action = new ActionEntity("act-123", "Estudo Arcano", BigDecimal.valueOf(15.0));
        action.setUserId(userId);
        action.setAreaId("area-fogo");
        action.setTaskEnergyType("NEUTRAL");
        action.setIsCompleted(false);

        when(actionRepository.findById("act-123")).thenReturn(Optional.of(action));
        when(actionRepository.save(any(ActionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        when(pranaService.processActionPrana(eq(userId), eq(action))).thenReturn(
                new PranaService.PranaTransactionResult(userId, 70, 60, -10, false, "NEUTRAL", "-10 Prana consumido.")
        );

        when(scoringEngineService.calculateAndDistributeScore(any(), any(), anyLong(), anyLong(), anyInt(), anyList()))
                .thenReturn(new ScoringEngineService.MultiAreaScoreDistribution(
                        BigDecimal.valueOf(15.0),
                        BigDecimal.valueOf(150.0),
                        0.1,
                        1.0,
                        10.0,
                        1.0,
                        1.0,
                        Map.of("area-fogo", BigDecimal.valueOf(150.0)),
                        Map.of("fire", BigDecimal.valueOf(150.0))
                ));

        var dto = new ActionController.CompleteActionDto(20L, 45L, 2, List.of());
        ResponseEntity<?> response = controller.completeAction("act-123", dto);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        ActionController.CompleteActionResponse body = (ActionController.CompleteActionResponse) response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.success()).isTrue();
        assertThat(body.finalScore()).isEqualByComparingTo(BigDecimal.valueOf(150.0));
        assertThat(body.currentPrana()).isEqualTo(60);
        assertThat(action.getIsCompleted()).isTrue();
    }

    @Test
    @DisplayName("Deve bloquear ação neutra se Mago estiver em exaustão total")
    void shouldBlockNeutralActionWhenExhausted() {
        when(userJpaRepository.findById(userId)).thenReturn(Optional.of(userEntity));

        ActionEntity action = new ActionEntity("act-ex", "Ação em Exaustão", BigDecimal.valueOf(10.0));
        action.setUserId(userId);
        action.setTaskEnergyType("NEUTRAL");

        when(actionRepository.findById("act-ex")).thenReturn(Optional.of(action));
        when(pranaService.processActionPrana(eq(userId), eq(action))).thenReturn(
                new PranaService.PranaTransactionResult(userId, 0, 0, 0, true, "NEUTRAL", "Mago em Exaustão!")
        );

        ResponseEntity<?> response = controller.completeAction("act-ex", null);

        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
        ActionController.CompleteActionResponse body = (ActionController.CompleteActionResponse) response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.success()).isFalse();
        assertThat(body.exhausted()).isTrue();
    }

    @Test
    @DisplayName("Deve retornar status correto de Prana")
    void shouldGetPranaStatus() {
        when(userJpaRepository.findById(userId)).thenReturn(Optional.of(userEntity));
        when(pranaService.getPrana(userId)).thenReturn(85);
        when(pranaService.isExhausted(userId)).thenReturn(false);

        ResponseEntity<ActionController.PranaStatusResponse> response = controller.getPranaStatus();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().pranaLevel()).isEqualTo(85);
        assertThat(response.getBody().exhausted()).isFalse();
    }
}
