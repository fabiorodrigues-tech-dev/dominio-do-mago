package com.dominiodomago.domain.service.ai;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class NutricaoAgent {
    public String processar(String userInput, UUID userId) {
        return "[Agente de Nutrição e Esportes] - Processando dieta/treino para: " + userInput;
    }
}
