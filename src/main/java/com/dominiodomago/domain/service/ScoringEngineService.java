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

    // Parâmetros da Curva Agressiva de Tempo
    private static final double AGGRESSIVE_DECAY_RATE = 0.025; // k na fórmula e^(-k * t)
    private static final double MIN_TIME_MULTIPLIER = 0.15;     // Piso mínimo para evitar perda de incentivo
    private static final double MAX_EARLY_BONUS_MULTIPLIER = 1.50; // Teto de bônus por agilidade

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
            double timeMultiplier,
            double astroMultiplier,
            double streakMultiplier,
            double pranaMultiplier,
            Map<String, BigDecimal> areaDistribution,
            Map<String, BigDecimal> elementDistribution
    ) {}

    /**
     * Calcula o multiplicador através da Curva Agressiva de Tempo.
     *
     * @param delayMinutes Minutos de atraso em relação ao bloco ou horário estipulado.
     *                     Valores negativos indicam conclusão antecipada.
     */
    public double calculateAggressiveTimeCurveMultiplier(long delayMinutes) {
        if (delayMinutes <= 0) {
            // Conclusão antecipada ou pontual: bônus crescente de agilidade
            long earlyMinutes = Math.abs(delayMinutes);
            double bonus = 1.00 + Math.min(MAX_EARLY_BONUS_MULTIPLIER - 1.00, earlyMinutes * 0.02);
            return Math.round(bonus * 100.0) / 100.0;
        }

        // Queda exponencial agressiva para combater a procrastinação (TDAH focus)
        double decayed = Math.exp(-AGGRESSIVE_DECAY_RATE * delayMinutes);
        double multiplier = Math.max(MIN_TIME_MULTIPLIER, decayed);
        return Math.round(multiplier * 100.0) / 100.0;
    }

    /**
     * Executa o pipeline de pontuação ADR-000 e distribui o resultado nas áreas associadas (100/60/30).
     *
     * @param action        Ação que foi executada
     * @param user          Mago executor
     * @param delayMinutes  Minutos de atraso ou antecipação
     * @param areaIdsInOrder Lista ordenada de IDs de áreas (Primária na pos 0, Secundária na pos 1, Terciária na pos 2)
     */
    public MultiAreaScoreDistribution calculateAndDistributeScore(ActionEntity action,
                                                                   UserEntity user,
                                                                   long delayMinutes,
                                                                   List<String> areaIdsInOrder) {
        BigDecimal baseValue = (action != null && action.getBaseValue() != null)
                ? action.getBaseValue()
                : BigDecimal.valueOf(10.00);

        // 1. Curva Agressiva de Tempo
        double timeMultiplier = calculateAggressiveTimeCurveMultiplier(delayMinutes);

        // 2. Modificador Astrológico
        String primaryElement = resolvePrimaryElement(action, areaIdsInOrder);
        BigDecimal astroMod = astroStateService.getElementModifier(primaryElement);
        double astroMultiplier = astroMod != null ? astroMod.doubleValue() : 1.00;

        // 3. Multiplicador de Streak do Usuário
        double streakMultiplier = (user != null && user.getXpMultiplier() != null)
                ? user.getXpMultiplier().doubleValue()
                : 1.00;

        // 4. Modificador de Prana (Exaustão vs Flow State)
        double pranaMultiplier = 1.00;
        if (user != null) {
            int prana = user.getPranaLevel();
            if (prana <= 0) {
                pranaMultiplier = 0.50; // Debuff de Exaustão Arcana: 50% de rendimento
            } else if (prana >= 80) {
                pranaMultiplier = 1.15; // Bônus de Alta Energia / Flow State: +15%
            }
        }

        // 5. Pontuação Final Combinada (ADR-000)
        double rawCombined = baseValue.doubleValue() * timeMultiplier * astroMultiplier * streakMultiplier * pranaMultiplier;
        BigDecimal finalScore = BigDecimal.valueOf(rawCombined).setScale(2, RoundingMode.HALF_UP);

        // 6. Distribuição Multi-Área 100/60/30
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

        log.info("🎯 [ScoringEngine ADR-000] Ação='{}' | Base={} | Tempo={:.2f}x | Astro={:.2f}x | Streak={:.2f}x | Prana={:.2f}x => Final={}",
                action != null ? action.getTitle() : "Ação", baseValue, timeMultiplier, astroMultiplier, streakMultiplier, pranaMultiplier, finalScore);

        return new MultiAreaScoreDistribution(
                baseValue,
                finalScore,
                timeMultiplier,
                astroMultiplier,
                streakMultiplier,
                pranaMultiplier,
                areaDistribution,
                elementDistribution
        );
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

        // Heurística baseada no ID da área
        String lowerId = areaId.toLowerCase();
        if (lowerId.contains("fogo") || lowerId.contains("fisic") || lowerId.contains("corpo") || lowerId.contains("sport")) return "fire";
        if (lowerId.contains("agua") || lowerId.contains("água") || lowerId.contains("emoc") || lowerId.contains("mind")) return "water";
        if (lowerId.contains("ar") || lowerId.contains("estud") || lowerId.contains("intelect") || lowerId.contains("livro")) return "air";
        return "earth";
    }
}
