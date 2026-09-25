package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.DailyAstroStateEntity;
import com.dominiodomago.infrastructure.persistence.repository.DailyAstroStateRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class DefaultDailyAstroStateService implements DailyAstroStateService {

    private static final Logger log = LoggerFactory.getLogger(DefaultDailyAstroStateService.class);

    // Época de referência lunar: Lua Nova canônica em 11 de Janeiro de 2024
    private static final LocalDate LUNAR_EPOCH = LocalDate.of(2024, 1, 11);
    private static final double SYNODIC_MONTH = 29.53058867;

    private final DailyAstroStateRepository astroStateRepository;
    private final ObjectMapper objectMapper;

    public DefaultDailyAstroStateService(DailyAstroStateRepository astroStateRepository, ObjectMapper objectMapper) {
        this.astroStateRepository = astroStateRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public DailyAstroStateEntity getTodayState() {
        return getOrCreateStateForDate(LocalDate.now());
    }

    @Override
    @Transactional
    public DailyAstroStateEntity getOrCreateStateForDate(LocalDate date) {
        String dateKey = date.toString();
        return astroStateRepository.findByDate(dateKey)
                .orElseGet(() -> generateAndSaveAstroState(date));
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTodayPranaRegenModifier() {
        DailyAstroStateEntity state = getTodayState();
        return state.getPranaRegenModifier() != null ? state.getPranaRegenModifier() : BigDecimal.valueOf(1.00);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getElementModifier(String element) {
        String normalized = normalizeElementKey(element);
        Map<String, BigDecimal> modifiers = getElementModifiersMap(LocalDate.now());
        return modifiers.getOrDefault(normalized, BigDecimal.valueOf(1.00));
    }

    @Override
    public Map<String, BigDecimal> getElementModifiersMap(LocalDate date) {
        DailyAstroStateEntity state = getOrCreateStateForDate(date);
        try {
            if (state.getElementModifiers() != null && !state.getElementModifiers().isBlank()) {
                return objectMapper.readValue(state.getElementModifiers(), new TypeReference<Map<String, BigDecimal>>() {});
            }
        } catch (Exception e) {
            log.error("Erro ao desserializar element_modifiers do cache astrológico para a data {}: {}", date, e.getMessage());
        }

        Map<String, BigDecimal> fallback = new HashMap<>();
        fallback.put("fire", BigDecimal.valueOf(1.00));
        fallback.put("earth", BigDecimal.valueOf(1.00));
        fallback.put("water", BigDecimal.valueOf(1.00));
        fallback.put("air", BigDecimal.valueOf(1.00));
        return fallback;
    }

    private DailyAstroStateEntity generateAndSaveAstroState(LocalDate date) {
        long daysSinceEpoch = ChronoUnit.DAYS.between(LUNAR_EPOCH, date);
        double lunarAge = ((daysSinceEpoch % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

        String moonPhase;
        BigDecimal pranaRegenModifier;

        if (lunarAge < 7.38) {
            moonPhase = "NEW";
            pranaRegenModifier = BigDecimal.valueOf(1.00);
        } else if (lunarAge < 14.76) {
            moonPhase = "WAXING";
            pranaRegenModifier = BigDecimal.valueOf(1.10);
        } else if (lunarAge < 22.14) {
            moonPhase = "FULL";
            pranaRegenModifier = BigDecimal.valueOf(1.25);
        } else {
            moonPhase = "WANING";
            pranaRegenModifier = BigDecimal.valueOf(0.85);
        }

        int signIndex = (int) Math.floor(((daysSinceEpoch / 2.5) % 4 + 4) % 4);
        String moonSign = switch (signIndex) {
            case 0 -> "fire";
            case 1 -> "earth";
            case 2 -> "air";
            default -> "water";
        };

        Map<String, BigDecimal> elementModifiers = new LinkedHashMap<>();
        switch (moonSign) {
            case "fire" -> {
                elementModifiers.put("fire", BigDecimal.valueOf(1.25));
                elementModifiers.put("air", BigDecimal.valueOf(1.10));
                elementModifiers.put("earth", BigDecimal.valueOf(1.00));
                elementModifiers.put("water", BigDecimal.valueOf(0.85));
            }
            case "earth" -> {
                elementModifiers.put("earth", BigDecimal.valueOf(1.25));
                elementModifiers.put("water", BigDecimal.valueOf(1.10));
                elementModifiers.put("fire", BigDecimal.valueOf(1.00));
                elementModifiers.put("air", BigDecimal.valueOf(0.85));
            }
            case "air" -> {
                elementModifiers.put("air", BigDecimal.valueOf(1.25));
                elementModifiers.put("fire", BigDecimal.valueOf(1.15));
                elementModifiers.put("water", BigDecimal.valueOf(1.00));
                elementModifiers.put("earth", BigDecimal.valueOf(0.85));
            }
            default -> { // water
                elementModifiers.put("water", BigDecimal.valueOf(1.25));
                elementModifiers.put("earth", BigDecimal.valueOf(1.10));
                elementModifiers.put("air", BigDecimal.valueOf(1.00));
                elementModifiers.put("fire", BigDecimal.valueOf(0.80));
            }
        }

        List<String> transits = new ArrayList<>();
        transits.add(String.format("Lua %s em %s", moonPhase, moonSign.toUpperCase()));
        if (pranaRegenModifier.compareTo(BigDecimal.valueOf(1.00)) > 0) {
            transits.add("Corrente Telúrica Favorável: + " + pranaRegenModifier.subtract(BigDecimal.ONE).multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP) + "% de Prana");
        } else if (pranaRegenModifier.compareTo(BigDecimal.valueOf(1.00)) < 0) {
            transits.add("Maré Minguante: Conservação Arcana exigida (-15% de Regen)");
        }
        transits.add(String.format("Harmonia Primária: Elemento %s amplificado", moonSign.toUpperCase()));

        String transitsJson;
        String modifiersJson;
        try {
            transitsJson = objectMapper.writeValueAsString(transits);
            modifiersJson = objectMapper.writeValueAsString(elementModifiers);
        } catch (Exception e) {
            log.error("Erro ao serializar dados astrológicos: {}", e.getMessage());
            transitsJson = "[]";
            modifiersJson = "{\"fire\":1.0,\"earth\":1.0,\"water\":1.0,\"air\":1.0}";
        }

        DailyAstroStateEntity entity = new DailyAstroStateEntity(
                date.toString(),
                moonPhase,
                moonSign,
                transitsJson,
                pranaRegenModifier,
                modifiersJson
        );

        DailyAstroStateEntity saved = astroStateRepository.save(entity);
        log.info("🌌 [Motor Astrológico] Estado para {} gerado com sucesso: Fase={}, Signo={}, ModificadorPrana={}",
                date, moonPhase, moonSign, pranaRegenModifier);
        return saved;
    }

    private String normalizeElementKey(String element) {
        if (element == null) return "fire";
        String lower = element.toLowerCase().trim();
        if (lower.contains("fog") || lower.contains("fir")) return "fire";
        if (lower.contains("ter") || lower.contains("eart")) return "earth";
        if (lower.contains("agu") || lower.contains("águ") || lower.contains("wat")) return "water";
        if (lower.contains("ar") || lower.contains("air")) return "air";
        return "fire";
    }
}
