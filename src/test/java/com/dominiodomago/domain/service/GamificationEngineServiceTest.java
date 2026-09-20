package com.dominiodomago.domain.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GamificationEngineServiceTest {

    @Mock
    private UserJpaRepository userRepository;

    @Mock
    private com.dominiodomago.infrastructure.persistence.repository.TrophyRepository trophyRepository;

    private GamificationEngineService gamificationEngineService;

    @BeforeEach
    void setUp() {
        gamificationEngineService = new GamificationEngineService(userRepository, trophyRepository);
    }

    @Test
    @DisplayName("Deve calcular nível 1 quando o XP total for inferior a 100")
    void shouldBeLevelOneWhenTotalXpBelow100() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setFireXp(20);
        user.setWaterXp(20);
        user.setEarthXp(20);
        user.setAirXp(20); // total 80

        gamificationEngineService.calculateLevelUp(user);

        assertEquals(1, user.getArcaneLevel());
        assertEquals(80, user.getTotalTrophyPoints());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("A cada 100 XP combinados, deve subir de nível arcano proporcionalmente")
    void shouldLevelUpEvery100Xp() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setFireXp(100);
        user.setWaterXp(50);
        user.setEarthXp(120);
        user.setAirXp(80); // total = 350 -> level = 1 + (350 / 100) = 4

        gamificationEngineService.calculateLevelUp(user);

        assertEquals(4, user.getArcaneLevel());
        assertEquals(350, user.getTotalTrophyPoints());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Deve deduzir HP corretamente quando o Mago sofrer penalidade")
    void shouldDeductHpCorrectly() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setHp(100);

        gamificationEngineService.deductHp(user, 25);

        assertEquals(75, user.getHp());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Não deve permitir que o HP caia abaixo de 0")
    void shouldNotAllowHpBelowZero() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        user.setHp(15);

        gamificationEngineService.deductHp(user, 30);

        assertEquals(0, user.getHp());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Deve lidar com usuário nulo sem lançar exceção")
    void shouldHandleNullUserGracefully() {
        gamificationEngineService.deductHp(null, 20);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve desbloquear troféus correspondentes quando o XP ultrapassar os marcos")
    void shouldUnlockTrophiesWhenMilestonesReached() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        java.util.UUID userId = java.util.UUID.randomUUID();
        user.setId(userId);
        user.setFireXp(300);
        user.setWaterXp(300); // Total 600 -> Deve desbloquear "Primeira Centelha" (>= 500)
        when(trophyRepository.existsByUserIdAndTitle(userId, "Primeira Centelha")).thenReturn(false);

        gamificationEngineService.checkAndUnlockTrophies(user);

        verify(trophyRepository, times(1)).save(any());
    }
}
