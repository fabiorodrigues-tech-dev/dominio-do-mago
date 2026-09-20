package com.dominiodomago.domain.service;

import static org.junit.jupiter.api.Assertions.*;
import java.util.List;
import java.util.random.RandomGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GachaAlgorithmServiceTest {

    private GachaAlgorithmService gachaService;
    private MockRandomGenerator mockRandom;

    // Classe Mock simples para controlar o Math.random no teste
    static class MockRandomGenerator implements RandomGenerator {
        private double fixedValue;
        public void setNextDouble(double fixedValue) { this.fixedValue = fixedValue; }
        @Override public long nextLong() { return 0; }
        @Override public double nextDouble() { return fixedValue; }
    }

    @BeforeEach
    void setUp() {
        mockRandom = new MockRandomGenerator();
        gachaService = new GachaAlgorithmService(mockRandom);
    }

    @Test
    @DisplayName("Deve retornar nulo quando a lista estiver vazia")
    void shouldReturnNullWhenTaskListIsEmpty() {
        assertNull(gachaService.spin(List.of()));
    }

    @Test
    @DisplayName("Deve respeitar a distribuição de pesos matemáticos baseando-se na aleatoriedade real injetada")
    void shouldPrioritizeTaskBasedOnInjectedRandomness() {
        List<GachaAlgorithmService.TaskCandidate> tasks = List.of(
            new GachaAlgorithmService.TaskCandidate("1", "Meditação (Ar)", 1),
            new GachaAlgorithmService.TaskCandidate("2", "Treino Pesado (Fogo)", 9)
        );

        // Simulando que o gerador aleatório retornou o meio exato (0.5).
        // 0.5 * 10 (peso total) = 5.
        // O loop subtrai 1 (Meditação). Sobra 4. Cai na segunda tarefa.
        mockRandom.setNextDouble(0.5);

        GachaAlgorithmService.TaskCandidate selected = gachaService.spin(tasks);

        assertNotNull(selected);
        assertEquals("Treino Pesado (Fogo)", selected.title());
    }
}
