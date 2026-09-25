package com.dominiodomago.domain.service;

import com.dominiodomago.infrastructure.persistence.entity.DailyAstroStateEntity;
import com.dominiodomago.infrastructure.persistence.repository.DailyAstroStateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyAstroStateServiceTest {

    @Mock
    private DailyAstroStateRepository astroStateRepository;

    private DailyAstroStateService astroStateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        astroStateService = new DefaultDailyAstroStateService(astroStateRepository, objectMapper);
    }

    @Test
    @DisplayName("Deve retornar estado astrológico existente quando já estiver em cache")
    void shouldReturnCachedAstroStateIfExists() {
        LocalDate date = LocalDate.of(2026, 9, 25);
        DailyAstroStateEntity cached = new DailyAstroStateEntity(
                date.toString(),
                "FULL",
                "fire",
                "[\"Lua Cheia\"]",
                BigDecimal.valueOf(1.25),
                "{\"fire\":1.25,\"earth\":1.00,\"air\":1.10,\"water\":0.85}"
        );

        when(astroStateRepository.findByDate(date.toString())).thenReturn(Optional.of(cached));

        DailyAstroStateEntity result = astroStateService.getOrCreateStateForDate(date);

        assertEquals("FULL", result.getMoonPhase());
        assertEquals("fire", result.getMoonSign());
        assertEquals(BigDecimal.valueOf(1.25), result.getPranaRegenModifier());
        verify(astroStateRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve gerar e salvar novo estado astrológico se não estiver no banco")
    void shouldGenerateAndSaveWhenNotCached() {
        LocalDate date = LocalDate.of(2026, 9, 25);
        when(astroStateRepository.findByDate(date.toString())).thenReturn(Optional.empty());
        when(astroStateRepository.save(any(DailyAstroStateEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        DailyAstroStateEntity generated = astroStateService.getOrCreateStateForDate(date);

        assertNotNull(generated);
        assertEquals(date.toString(), generated.getDate());
        assertNotNull(generated.getMoonPhase());
        assertNotNull(generated.getMoonSign());
        assertNotNull(generated.getPranaRegenModifier());
        verify(astroStateRepository, times(1)).save(any(DailyAstroStateEntity.class));
    }

    @Test
    @DisplayName("Deve normalizar variações de nomes dos elementos para buscar modificador")
    void shouldNormalizeElementNames() {
        LocalDate date = LocalDate.now();
        DailyAstroStateEntity state = new DailyAstroStateEntity(
                date.toString(),
                "WAXING",
                "fire",
                "[]",
                BigDecimal.valueOf(1.10),
                "{\"fire\":1.25,\"earth\":1.00,\"air\":1.10,\"water\":0.85}"
        );
        when(astroStateRepository.findByDate(date.toString())).thenReturn(Optional.of(state));

        assertEquals(BigDecimal.valueOf(1.25), astroStateService.getElementModifier("Fogo"));
        assertEquals(BigDecimal.valueOf(1.25), astroStateService.getElementModifier("fire"));
        assertEquals(BigDecimal.valueOf(0.85), astroStateService.getElementModifier("água"));
    }
}
