package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.DailyAstroStateEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface DailyAstroStateService {

    DailyAstroStateEntity getTodayState();

    DailyAstroStateEntity getOrCreateStateForDate(LocalDate date);

    BigDecimal getTodayPranaRegenModifier();

    BigDecimal getElementModifier(String element);

    Map<String, BigDecimal> getElementModifiersMap(LocalDate date);
}
