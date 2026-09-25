package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class PranaService {

    private static final Logger log = LoggerFactory.getLogger(PranaService.class);

    public static final int MIN_PRANA = 0;
    public static final int MAX_PRANA = 100;
    public static final int DEFAULT_NEUTRAL_COST = 10;
    public static final int DEFAULT_RESTORATIVE_GAIN = 25;
    public static final int DEFAULT_POISON_DRAIN = 35;

    private final UserJpaRepository userRepository;
    private final DailyAstroStateService astroStateService;
    private final GamificationEngineService gamificationEngineService;

    public PranaService(UserJpaRepository userRepository,
                        DailyAstroStateService astroStateService,
                        GamificationEngineService gamificationEngineService) {
        this.userRepository = userRepository;
        this.astroStateService = astroStateService;
        this.gamificationEngineService = gamificationEngineService;
    }

    public record PranaTransactionResult(
            UUID userId,
            int previousPrana,
            int currentPrana,
            int delta,
            boolean exhausted,
            String taskEnergyType,
            String message
    ) {}

    /**
     * Retorna o nível atual de Prana do Mago (0 a 100).
     */
    @Transactional(readOnly = true)
    public int getPrana(UUID userId) {
        return findUser(userId).getPranaLevel();
    }

    /**
     * Verifica se o Mago se encontra em estado de Exaustão Arcana (Prana == 0).
     */
    @Transactional(readOnly = true)
    public boolean isExhausted(UUID userId) {
        return getPrana(userId) <= MIN_PRANA;
    }

    /**
     * Processa o impacto de uma Ação sobre o Prana do Mago de acordo com a sua tipagem energética:
     * - RESTORATIVE: regenera Prana (amplificado pelo modificador astrológico do dia) e encerra a exaustão.
     * - POISON: dreno severo de Prana. Se atingir 0, causa dano residual direto no HP do Mago.
     * - NEUTRAL: consome a energia padrão de foco/trabalho.
     */
    @Transactional
    public PranaTransactionResult processActionPrana(UUID userId, ActionEntity action) {
        String energyType = (action != null && action.getTaskEnergyType() != null)
                ? action.getTaskEnergyType().toUpperCase().trim()
                : "NEUTRAL";

        return switch (energyType) {
            case "RESTORATIVE" -> processRestorativeAction(userId, DEFAULT_RESTORATIVE_GAIN);
            case "POISON" -> processPoisonAction(userId, DEFAULT_POISON_DRAIN);
            default -> processNeutralAction(userId, DEFAULT_NEUTRAL_COST);
        };
    }

    /**
     * Consumo explícito de Prana para ações arcanas ou focos profundos.
     */
    @Transactional
    public PranaTransactionResult consumePrana(UUID userId, int cost) {
        return processNeutralAction(userId, Math.max(0, cost));
    }

    /**
     * Regeneração explícita de Prana (ex: descanso, meditação ou poções).
     */
    @Transactional
    public PranaTransactionResult restorePrana(UUID userId, int amount) {
        return processRestorativeAction(userId, Math.max(0, amount));
    }

    /**
     * Restaura completamente o Prana do Mago ao ápice (100).
     */
    @Transactional
    public PranaTransactionResult rechargeToFull(UUID userId) {
        UserEntity user = findUser(userId);
        int previous = user.getPranaLevel();
        user.setPranaLevel(MAX_PRANA);
        user.setLastPranaUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        log.info("🔮 [PRANA PLENO] Mago {} teve o seu Prana recarregado para 100!", user.getUsername());
        return new PranaTransactionResult(
                userId,
                previous,
                MAX_PRANA,
                MAX_PRANA - previous,
                false,
                "RESTORATIVE",
                "Prana totalmente revitalizado pela essência cósmica (100/100)."
        );
    }

    private PranaTransactionResult processRestorativeAction(UUID userId, int baseGain) {
        UserEntity user = findUser(userId);
        int previous = user.getPranaLevel();

        // Aplica o multiplicador astrológico de regeneração de Prana (ex: Lua Cheia = 1.25x)
        BigDecimal astroMod = astroStateService.getTodayPranaRegenModifier();
        int effectiveGain = Math.max(1, (int) Math.round(baseGain * astroMod.doubleValue()));

        int next = Math.min(MAX_PRANA, previous + effectiveGain);
        user.setPranaLevel(next);
        user.setLastPranaUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        log.info("🌿 [PRANA RESTAURADO] Mago {} recuperou {} Prana (Base: {}, Mod Astro: {}x). Nível atual: {}/100",
                user.getUsername(), effectiveGain, baseGain, astroMod, next);

        return new PranaTransactionResult(
                userId,
                previous,
                next,
                effectiveGain,
                next <= MIN_PRANA,
                "RESTORATIVE",
                String.format("Tarefa Restauradora concluída! +%d Prana revitalizado (Modificador Astrológico: %.2fx). Nível: %d/100",
                        effectiveGain, astroMod.doubleValue(), next)
        );
    }

    private PranaTransactionResult processPoisonAction(UUID userId, int drainAmount) {
        UserEntity user = findUser(userId);
        int previous = user.getPranaLevel();

        int remainingPrana = previous - drainAmount;
        int nextPrana;
        int hpDamage = 0;

        if (remainingPrana < MIN_PRANA) {
            nextPrana = MIN_PRANA;
            // O excesso de veneno consome os pontos de vida (HP) do Mago
            hpDamage = Math.abs(remainingPrana);
            gamificationEngineService.deductHp(user, hpDamage);
            log.warn("☠️ [VENENO CRÍTICO] Mago {} esgotou o Prana e sofreu {} de dano residual no HP!",
                    user.getUsername(), hpDamage);
        } else {
            nextPrana = remainingPrana;
        }

        user.setPranaLevel(nextPrana);
        user.setLastPranaUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        boolean exhausted = nextPrana <= MIN_PRANA;
        String message = exhausted
                ? String.format("☠️ Hábito Tóxico / Veneno executado! Prana zerado (-%d). Estado de EXAUSTÃO ARCANA atingido! Dano ao HP: %d.", drainAmount, hpDamage)
                : String.format("⚠️ Hábito Venenoso executado! -%d de Prana consumido. Prana restante: %d/100.", drainAmount, nextPrana);

        return new PranaTransactionResult(
                userId,
                previous,
                nextPrana,
                -drainAmount,
                exhausted,
                "POISON",
                message
        );
    }

    private PranaTransactionResult processNeutralAction(UUID userId, int cost) {
        UserEntity user = findUser(userId);
        int previous = user.getPranaLevel();

        if (previous <= MIN_PRANA) {
            log.warn("⛔ [EXAUSTÃO TOTAL] Mago {} tentou executar ação neutra com Prana zerado!", user.getUsername());
            return new PranaTransactionResult(
                    userId,
                    previous,
                    MIN_PRANA,
                    0,
                    true,
                    "NEUTRAL",
                    "⛔ Mago está em estado de EXAUSTÃO ARCANA (Prana 0). Realize rituais restauradores para voltar a agir!"
            );
        }

        int next = Math.max(MIN_PRANA, previous - cost);
        user.setPranaLevel(next);
        user.setLastPranaUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        boolean exhausted = next <= MIN_PRANA;
        return new PranaTransactionResult(
                userId,
                previous,
                next,
                -cost,
                exhausted,
                "NEUTRAL",
                exhausted
                        ? "Ação concluída, mas as reservas de Prana esgotaram-se completamente! Entrou em Exaustão."
                        : String.format("Ação realizada com foco. -%d Prana. Reservas atuais: %d/100.", cost, next)
        );
    }

    private UserEntity findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Mago não encontrado com ID: " + userId));
    }
}
