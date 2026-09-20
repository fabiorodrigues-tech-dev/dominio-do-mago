package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.TrophyEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.TrophyRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class GamificationEngineService {

    private static final Logger log = LoggerFactory.getLogger(GamificationEngineService.class);

    private final UserJpaRepository userRepository;
    private final TrophyRepository trophyRepository;

    public GamificationEngineService(UserJpaRepository userRepository, TrophyRepository trophyRepository) {
        this.userRepository = userRepository;
        this.trophyRepository = trophyRepository;
    }

    /**
     * Calcula a evolução de nível do Mago.
     * A cada 100 XP combinados (fogo, água, terra, ar), o Mago ganha 1 arcane_level.
     * Atualiza o nível arcano com base no XP total e persiste no repositório.
     *
     * @param user Usuário cuja evolução será recalculada
     */
    @Transactional
    public void calculateLevelUp(UserEntity user) {
        if (user == null) {
            return;
        }

        int totalXp = user.getFireXp() + user.getWaterXp() + user.getEarthXp() + user.getAirXp();
        int newLevel = Math.max(1, 1 + (totalXp / 100));
        int previousLevel = user.getArcaneLevel();

        user.setArcaneLevel(newLevel);
        user.setTotalTrophyPoints(totalXp);
        userRepository.save(user);

        if (newLevel > previousLevel) {
            log.info("🌟 [LEVEL UP] Mago {} ascendeu ao Nível Arcano {}! (XP Elemental Total: {})",
                    user.getUsername(), newLevel, totalXp);
        }

        checkAndUnlockTrophies(user);
    }

    /**
     * Verifica e desbloqueia troféus arcanos para o Mago com base em seus marcos de progresso e XP.
     *
     * @param user Usuário para o qual os troféus serão avaliados
     */
    @Transactional
    public void checkAndUnlockTrophies(UserEntity user) {
        if (user == null || user.getId() == null) {
            return;
        }

        int totalXp = Math.max(
                user.getTotalTrophyPoints(),
                user.getFireXp() + user.getWaterXp() + user.getEarthXp() + user.getAirXp()
        );

        // Marco 1: Primeira Centelha (Bronze) - >= 500 XP
        if (totalXp >= 500) {
            unlockTrophyIfNotPresent(
                    user,
                    "Primeira Centelha",
                    "Despertar da centelha mágica e conclusão dos primeiros rituais elementais.",
                    "BRONZE",
                    "flame"
            );
        }

        // Marco 2: Fluidez de Água (Prata) - >= 1000 XP
        if (totalXp >= 1000) {
            unlockTrophyIfNotPresent(
                    user,
                    "Fluidez de Água",
                    "Harmonização dos fluxos mentais, meditação profunda e equilíbrio elemental.",
                    "SILVER",
                    "droplet"
            );
        }

        // Marco 3: Pilar de Terra (Ouro) - >= 1500 XP
        if (totalXp >= 1500) {
            unlockTrophyIfNotPresent(
                    user,
                    "Pilar de Terra",
                    "Rotina diária inabalável, consistência sólida e foco inabalável.",
                    "GOLD",
                    "mountain"
            );
        }

        // Marco 4: Mestre da Aura (Platina) - >= 2000 XP
        if (totalXp >= 2000) {
            unlockTrophyIfNotPresent(
                    user,
                    "Mestre da Aura",
                    "Alcançou a mestria absoluta da Aura Arcana e expansão máxima de presença.",
                    "PLATINUM",
                    "award"
            );
        }
    }

    private void unlockTrophyIfNotPresent(UserEntity user, String title, String description, String tier, String iconType) {
        if (!trophyRepository.existsByUserIdAndTitle(user.getId(), title)) {
            TrophyEntity trophy = new TrophyEntity(user, title, description, tier, iconType, LocalDateTime.now());
            trophyRepository.save(trophy);
            log.info("🏆 [TROFÉU DESBLOQUEADO] Mago {} conquistou o troféu '{}' ({})!",
                    user.getUsername(), title, tier);
        }
    }

    /**
     * Deduz pontos de vida (HP) do Mago devido a procrastinação, desvio de foco ou quebra de rituais.
     * Se o HP cair abaixo de 0, define como 0.
     *
     * @param user   Usuário que sofrerá a penalidade
     * @param damage Quantidade de HP a ser deduzida
     */
    @Transactional
    public void deductHp(UserEntity user, int damage) {
        if (user == null) {
            return;
        }

        int currentHp = user.getHp();
        int newHp = Math.max(0, currentHp - damage);
        user.setHp(newHp);
        userRepository.save(user);

        log.warn("⚔️ [DANO RECEBIDO] Mago {} sofreu {} de dano no HP! (HP anterior: {}, HP atual: {})",
                user.getUsername(), damage, currentHp, newHp);
    }

    /**
     * Modifica a energia (stamina) do Mago.
     * O limite máximo é 100 e o mínimo é 0.
     *
     * @param user   Usuário cuja energia será modificada
     * @param amount Quantidade de energia a ser adicionada (positivo) ou removida (negativo)
     */
    @Transactional
    public void modifyEnergy(UserEntity user, int amount) {
        if (user == null) {
            return;
        }

        int currentEnergy = user.getEnergy();
        int newEnergy = Math.max(0, Math.min(100, currentEnergy + amount));
        user.setEnergy(newEnergy);
        userRepository.save(user);

        if (amount > 0) {
            log.info("⚡ [ENERGIA RESTAURADA] Mago {} recuperou {} de energia! (Energia anterior: {}, Atual: {})",
                    user.getUsername(), amount, currentEnergy, newEnergy);
        } else if (amount < 0) {
            log.warn("🔋 [ENERGIA DRENADA] Mago {} gastou {} de energia! (Energia anterior: {}, Atual: {})",
                    user.getUsername(), Math.abs(amount), currentEnergy, newEnergy);
        }
    }
}
