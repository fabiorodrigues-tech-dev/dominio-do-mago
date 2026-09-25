package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PranaServiceTest {

    @Mock
    private UserJpaRepository userRepository;

    @Mock
    private com.dominiodomago.infrastructure.persistence.repository.TrophyRepository trophyRepository;

    @Mock
    private DailyAstroStateService astroStateService;

    private GamificationEngineService gamificationEngineService;
    private PranaService pranaService;
    private UserEntity user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        gamificationEngineService = new GamificationEngineService(userRepository, trophyRepository);
        pranaService = new PranaService(userRepository, astroStateService, gamificationEngineService);
        userId = UUID.randomUUID();
        user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setId(userId);
        user.setPranaLevel(50);
        user.setHp(100);
    }

    @Test
    @DisplayName("Deve consumir Prana em ação neutra e atualizar banco")
    void shouldConsumePranaForNeutralAction() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        ActionEntity action = new ActionEntity("act-1", "Foco no Código", BigDecimal.valueOf(10));
        action.setTaskEnergyType("NEUTRAL");

        var result = pranaService.processActionPrana(userId, action);

        assertEquals(40, result.currentPrana());
        assertEquals(-10, result.delta());
        assertFalse(result.exhausted());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Ação restauradora deve recuperar Prana considerando o modificador astrológico")
    void shouldRestorePranaWithAstroModifier() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Simula modificador astrológico favorável de Lua Cheia (1.20x)
        when(astroStateService.getTodayPranaRegenModifier()).thenReturn(BigDecimal.valueOf(1.20));

        ActionEntity action = new ActionEntity("act-2", "Meditação das Marés", BigDecimal.valueOf(10));
        action.setTaskEnergyType("RESTORATIVE");

        var result = pranaService.processActionPrana(userId, action);

        // Ganho base 25 * 1.20 = 30 -> 50 + 30 = 80
        assertEquals(80, result.currentPrana());
        assertEquals(30, result.delta());
        assertFalse(result.exhausted());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Prana não deve ultrapassar o limite máximo de 100")
    void shouldCapPranaAt100() {
        user.setPranaLevel(90);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(astroStateService.getTodayPranaRegenModifier()).thenReturn(BigDecimal.valueOf(1.00));

        var result = pranaService.restorePrana(userId, 25);

        assertEquals(100, result.currentPrana());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Hábito venenoso deve drenar Prana e causar dano residual ao HP se zerar o Prana")
    void shouldDrainPranaAndDamageHpOnPoisonExhaustion() {
        user.setPranaLevel(20);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        ActionEntity poisonAction = new ActionEntity("act-3", "Redes Sociais Excessivas", BigDecimal.valueOf(5));
        poisonAction.setTaskEnergyType("POISON"); // Dreno padrão 35 -> 20 - 35 = -15 -> 0 Prana, 15 dano HP

        var result = pranaService.processActionPrana(userId, poisonAction);

        assertEquals(0, result.currentPrana());
        assertTrue(result.exhausted());
        // Excess 15 damage to HP (100 - 15 = 85)
        assertEquals(85, user.getHp());
        verify(userRepository, times(2)).save(user); // 1 pelo Prana e 1 pelo deductHp
    }

    @Test
    @DisplayName("Não deve permitir gasto de Prana quando o Mago já estiver exausto (Prana 0)")
    void shouldBlockActionWhenAlreadyExhausted() {
        user.setPranaLevel(0);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        ActionEntity neutralAction = new ActionEntity("act-4", "Trabalho Pesado", BigDecimal.valueOf(10));
        neutralAction.setTaskEnergyType("NEUTRAL");

        var result = pranaService.processActionPrana(userId, neutralAction);

        assertEquals(0, result.currentPrana());
        assertTrue(result.exhausted());
        assertTrue(result.message().contains("EXAUSTÃO ARCANA"));
        verify(userRepository, never()).save(any());
    }
}
