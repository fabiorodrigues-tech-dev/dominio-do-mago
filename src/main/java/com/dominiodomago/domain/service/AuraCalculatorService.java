package com.dominiodomago.domain.service;

import org.springframework.stereotype.Service;

@Service
public class AuraCalculatorService {

    /**
     * Calcula o raio da Aura visual com base no XP do usuário.
     * Curva de Progressão (XP):
     * - Nível 1: 0 a 99 XP (Raio base: 1.0)
     * - Nível 2: 100 a 299 XP (Raio base: 2.0)
     * - Nível 3: 300 a 599 XP (Raio base: 3.0)
     * - Nível 4: 600 a 999 XP (Raio base: 4.0)
     * - Nível 5 (Máximo): 1000+ XP (Raio base: 5.0)
     *
     * A função utiliza interpolação linear para garantir que a transição entre níveis seja fluida.
     * Exemplo: XP = 150 (metade do nível 2) resultará num raio de ~2.25
     *
     * @param userAuraXp Pontos de experiência de Aura do usuário
     * @return O raio calculado para o frontend (1.0 a 5.0)
     */
    public double calculateAuraRadius(int userAuraXp) {
        if (userAuraXp < 0) {
            return 1.0;
        }

        // Definição dos limiares de cada nível
        int level1Max = 99;
        int level2Max = 299;
        int level3Max = 599;
        int level4Max = 999;
        int level5Min = 1000;

        // Se o usuário alcançou o nível máximo
        if (userAuraXp >= level5Min) {
            return 5.0; // Raio máximo
        }

        double baseRadius;
        double currentXpInLevel;
        double totalXpForNextLevel;

        // Identifica o nível atual e calcula a fração de progresso para o próximo nível
        if (userAuraXp <= level1Max) {
            baseRadius = 1.0;
            currentXpInLevel = userAuraXp;
            totalXpForNextLevel = level1Max + 1.0; // 100 pontos para completar o nível 1 (0 a 99)
        } else if (userAuraXp <= level2Max) {
            baseRadius = 2.0;
            currentXpInLevel = userAuraXp - (level1Max + 1);
            totalXpForNextLevel = level2Max - level1Max; // 200 pontos para completar o nível 2 (100 a 299)
        } else if (userAuraXp <= level3Max) {
            baseRadius = 3.0;
            currentXpInLevel = userAuraXp - (level2Max + 1);
            totalXpForNextLevel = level3Max - level2Max; // 300 pontos para completar o nível 3 (300 a 599)
        } else {
            baseRadius = 4.0;
            currentXpInLevel = userAuraXp - (level3Max + 1);
            totalXpForNextLevel = level4Max - level3Max; // 400 pontos para completar o nível 4 (600 a 999)
        }

        // Interpolação suave: Raio base + (fração completada do nível atual)
        double interpolatedRadius = baseRadius + (currentXpInLevel / totalXpForNextLevel);

        // Limita a duas casas decimais
        return Math.round(interpolatedRadius * 100.0) / 100.0;
    }
}
