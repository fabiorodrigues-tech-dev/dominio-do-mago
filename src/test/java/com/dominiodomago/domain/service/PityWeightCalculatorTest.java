package com.dominiodomago.domain.service;

import static org.junit.jupiter.api.Assertions.*;

import com.dominiodomago.domain.model.Element;
import com.dominiodomago.domain.model.TaskSnapshot;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PityWeightCalculatorTest {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final LocalDate TODAY = LocalDate.of(2026, 9, 20);

    private PityWeightCalculator calculator;

    @BeforeEach
    void setUp() {
        Clock fixedClock = Clock.fixed(TODAY.atStartOfDay(ZONE).toInstant(), ZONE);
        // 15% de crescimento por dia negligenciado, teto de 5x o peso base
        calculator = new PityWeightCalculator(fixedClock, 0.15, 5.0);
    }

    @Test
    @DisplayName("Tarefa feita hoje mantém o peso base (sem bônus de pity)")
    void shouldKeepBaseWeightWhenCompletedToday() {
        TaskSnapshot task = new TaskSnapshot(UUID.randomUUID(), "Beber água", Element.AGUA, 2, TODAY);

        assertEquals(2, calculator.calculateDynamicWeight(task));
    }

    @Test
    @DisplayName("Tarefa negligenciada por vários dias deve ganhar peso crescente")
    void shouldIncreaseWeightAsDaysNeglectedGrows() {
        TaskSnapshot task = new TaskSnapshot(UUID.randomUUID(), "Organizar finanças", Element.TERRA, 2, TODAY.minusDays(10));

        // multiplicador = 1 + 10*0.15 = 2.5 -> peso = ceil(2 * 2.5) = 5
        assertEquals(5, calculator.calculateDynamicWeight(task));
    }

    @Test
    @DisplayName("Peso dinâmico nunca deve ultrapassar o teto (maxMultiplier)")
    void shouldCapWeightAtMaxMultiplier() {
        TaskSnapshot task = new TaskSnapshot(UUID.randomUUID(), "Ler um livro", Element.AR, 2, TODAY.minusDays(1000));

        // multiplicador travado em 5.0 -> peso = ceil(2 * 5.0) = 10
        assertEquals(10, calculator.calculateDynamicWeight(task));
    }

    @Test
    @DisplayName("Tarefa nunca completada é tratada como fortemente negligenciada")
    void shouldTreatNeverCompletedAsHeavilyNeglected() {
        TaskSnapshot task = new TaskSnapshot(UUID.randomUUID(), "Primeira meta", Element.FOGO, 1, null);

        assertTrue(calculator.calculateDynamicWeight(task) > 1);
    }
}
