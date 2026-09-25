package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.AreaEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.AreaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ScoringEngineService {

    private static final Logger log = LoggerFactory.getLogger(ScoringEngineService.class);

    // Proporções de Distribuição Multi-Área (Conselho Elemental v4.0 / ADR-000)
    public static final BigDecimal PRIMARY_AREA_WEIGHT = BigDecimal.valueOf(1.00);   // 100%
    public static final BigDecimal SECONDARY_AREA_WEIGHT = BigDecimal.valueOf(0.60); // 60%
    public static final BigDecimal TERTIARY_AREA_WEIGHT = BigDecimal.valueOf(0.30);  // 30%

    private final DailyAstroStateService astroStateService;
    private final AreaRepository areaRepository;

    public ScoringEngineService(DailyAstroStateService astroStateService, AreaRepository areaRepository) {
        this.astroStateService = astroStateService;
        this.areaRepository = areaRepository;
    }

    public record MultiAreaScoreDistribution(
            BigDecimal baseValue,
            BigDecimal finalScore,
            double presenceBonus,
            double effortMultiplier,
            double timeMultiplier,
            double astroMultiplier,
            double exhaustionMultiplier,
            Map<String, BigDecimal> areaDistribution,
            Map<String, BigDecimal> elementDistribution
    ) {}

    /**
     * Calcula o Presence Bonus determinístico por lookup de tempo real em segundos:
     * - < 30s: 0.0
     * - 30-59s: 0.1
     * - 60-119s: 0.3
     * - >= 120s: 0.5
     */
    public double calculatePresenceBonus(long presenceSeconds) {
        if (presenceSeconds < 30) {
            return 0.0;
        } else if (presenceSeconds < 60) {
            return 0.1;
        } else if (presenceSeconds < 120) {
            return 0.3;
        } else {
            return 0.5;
        }
    }

    /**
     * Calcula o multiplicador de esforço (effort_level de 1 a 5):
     * - 1: 1.0
     * - 2: 1.2
     * - 3: 1.5
     * - 4: 2.0
     * - 5: 2.8
     */
    public double calculateEffortMultiplier(int effortLevel) {
        return switch (effortLevel) {
            case 2 -> 1.2;
            case 3 -> 1.5;
            case 4 -> 2.0;
            case 5 -> 2.8;
            default -> 1.0;
        };
    }

    /**
     * Aplica a Curva Agressiva de Tempo canônica (por faixa de minutos de duração/foco):
     * - < 5 min: x1.0
     * - 5-15 min: x2.0
     * - 16-30 min: x6.0
     * - 31-60 min: x15.0
     * - 61-90 min: x30.0
     * - 91-120 min: x50.0
     * - > 120 min: x80.0
     */
    public double calculateAggressiveTimeMultiplier(long durationMinutes) {
        if (durationMinutes < 5) {
            return 1.0;
        } else if (durationMinutes <= 15) {
            return 2.0;
        } else if (durationMinutes <= 30) {
            return 6.0;
        } else if (durationMinutes <= 60) {
            return 15.0;
        } else if (durationMinutes <= 90) {
            return 30.0;
        } else if (durationMinutes <= 120) {
            return 50.0;
        } else {
            return 80.0;
        }
    }

    /**
     * Calcula o multiplicador de exaustão:
     * - 0.5 se prana <= 0 (Debuff de Exaustão Arcana)
     * - 1.0 caso contrário
     */
    public double calculateExhaustionMultiplier(UserEntity user) {
        if (user != null && user.getPranaLevel() <= 0) {
            return 0.5;
        }
        return 1.0;
    }

    /**
     * Executa o pipeline canônico exato de pontuação ADR-000:
     * FinalScore = BaseValue * (1 + presence_bonus) * M_effort * M_time * M_astro * M_exhaustion
     * E distribui o resultado nas áreas associadas (100% primária, 60% secundária, 30% terciária).
     *
     * @param action          Ação/hábito executado
     * @param user            Mago executor
     * @param durationMinutes Minutos de foco/execução
     * @param presenceSeconds Segundos de presença em tempo real
     * @param effortLevel     Nível de esforço (1 a 5)
     * @param areaIdsInOrder  Lista de áreas na ordem [primária, secundária, terciária]
     */
    public MultiAreaScoreDistribution calculateAndDistributeScore(ActionEntity action,
                                                                   UserEntity user,
                                                                   long durationMinutes,
                                                                   long presenceSeconds,
                                                                   int effortLevel,
                                                                   List<String> areaIdsInOrder) {
        BigDecimal baseValue = (action != null && action.getBaseValue() != null)
                ? action.getBaseValue()
                : BigDecimal.valueOf(10.00);

        // 1. Presence Bonus: (1 + presence_bonus)
        double presenceBonus = calculatePresenceBonus(presenceSeconds);
        double presenceFactor = 1.0 + presenceBonus;

        // 2. Multiplicador de Esforço: effort_level 1..5
        double effortMultiplier = calculateEffortMultiplier(effortLevel);

        // 3. Curva de Tempo Agressiva
        double timeMultiplier = calculateAggressiveTimeMultiplier(durationMinutes);

        // 4. Modificador Astrológico do elemento da área primária
        String primaryElement = resolvePrimaryElement(action, areaIdsInOrder);
        BigDecimal astroMod = astroStateService.getElementModifier(primaryElement);
        double astroMultiplier = astroMod != null ? astroMod.doubleValue() : 1.00;

        // 5. Multiplicador de Exaustão (0.5 se prana <= 0, senão 1.0)
        double exhaustionMultiplier = calculateExhaustionMultiplier(user);

        // 6. Pontuação Final Combinada (ADR-000)
        double rawCombined = baseValue.doubleValue()
                * presenceFactor
                * effortMultiplier
                * timeMultiplier
                * astroMultiplier
                * exhaustionMultiplier;

        BigDecimal finalScore = BigDecimal.valueOf(rawCombined).setScale(2, RoundingMode.HALF_UP);

        // 7. Distribuição Multi-Área 100/60/30
        Map<String, BigDecimal> areaDistribution = new LinkedHashMap<>();
        Map<String, BigDecimal> elementDistribution = new LinkedHashMap<>();

        List<String> activeAreaIds = cleanAreaList(action, areaIdsInOrder);

        for (int i = 0; i < activeAreaIds.size(); i++) {
            String areaId = activeAreaIds.get(i);
            BigDecimal weight = switch (i) {
                case 0 -> PRIMARY_AREA_WEIGHT;   // 100%
                case 1 -> SECONDARY_AREA_WEIGHT; // 60%
                case 2 -> TERTIARY_AREA_WEIGHT;  // 30%
                default -> BigDecimal.ZERO;
            };

            if (weight.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal allocatedScore = finalScore.multiply(weight).setScale(2, RoundingMode.HALF_UP);
                areaDistribution.put(areaId, allocatedScore);

                // Mapeia para o elemento correspondente à área
                String element = mapAreaToElement(areaId);
                elementDistribution.merge(element, allocatedScore, BigDecimal::add);
            }
        }

        log.info("🎯 [ScoringEngine ADR-000] Ação='{}' | Base={} | Presença=(1+{:.1f}) | Esforço={:.1f}x | Tempo={:.1f}x | Astro={:.2f}x | Exaustão={:.1f}x => Final={}",
                action != null ? action.getTitle() : "Ação", baseValue, presenceBonus, effortMultiplier, timeMultiplier, astroMultiplier, exhaustionMultiplier, finalScore);

        return new MultiAreaScoreDistribution(
                baseValue,
                finalScore,
                presenceBonus,
                effortMultiplier,
                timeMultiplier,
                astroMultiplier,
                exhaustionMultiplier,
                areaDistribution,
                elementDistribution
        );
    }

    /**
     * Sobrecarga de conveniência com valores padrão para presença (0s) e esforço (nível 1).
     */
    public MultiAreaScoreDistribution calculateAndDistributeScore(ActionEntity action,
                                                                   UserEntity user,
                                                                   long durationMinutes,
                                                                   List<String> areaIdsInOrder) {
        return calculateAndDistributeScore(action, user, durationMinutes, 0, 1, areaIdsInOrder);
    }

    private List<String> cleanAreaList(ActionEntity action, List<String> areaIdsInOrder) {
        List<String> result = new ArrayList<>();
        if (areaIdsInOrder != null) {
            for (String id : areaIdsInOrder) {
                if (id != null && !id.isBlank() && !result.contains(id)) {
                    result.add(id);
                }
            }
        }

        if (result.isEmpty() && action != null && action.getAreaId() != null && !action.getAreaId().isBlank()) {
            result.add(action.getAreaId());
        }

        if (result.isEmpty()) {
            result.add("area-sem-categoria");
        }

        return result;
    }

    private String resolvePrimaryElement(ActionEntity action, List<String> areaIdsInOrder) {
        String primaryAreaId = (areaIdsInOrder != null && !areaIdsInOrder.isEmpty())
                ? areaIdsInOrder.get(0)
                : (action != null ? action.getAreaId() : null);

        return mapAreaToElement(primaryAreaId);
    }

    private String mapAreaToElement(String areaId) {
        if (areaId == null) return "earth";

        Optional<AreaEntity> areaOpt = areaRepository.findById(areaId);
        if (areaOpt.isPresent()) {
            String bodyId = areaOpt.get().getBodyId();
            if (bodyId != null) {
                String lower = bodyId.toLowerCase();
                if (lower.contains("fire") || lower.contains("fogo")) return "fire";
                if (lower.contains("water") || lower.contains("agua") || lower.contains("água")) return "water";
                if (lower.contains("air") || lower.contains("ar")) return "air";
                if (lower.contains("earth") || lower.contains("terra")) return "earth";
            }
        }

        String lowerId = areaId.toLowerCase();
        if (lowerId.contains("fogo") || lowerId.contains("fisic") || lowerId.contains("corpo") || lowerId.contains("sport")) return "fire";
        if (lowerId.contains("agua") || lowerId.contains("água") || lowerId.contains("emoc") || lowerId.contains("mind")) return "water";
        if (lowerId.contains("ar") || lowerId.contains("estud") || lowerId.contains("intelect") || lowerId.contains("livro")) return "air";
        return "earth";
    }
}
