package com.dominiodomago.domain.service.ai;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class EstudosAgent {
    public String processar(String userInput, UUID userId) {
        return "[Agente de Estudos e Carreira] - Processando pdfs/resumo para: " + userInput;
    }
}
