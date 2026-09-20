package com.dominiodomago.domain.model;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Retrato imutável de uma tarefa no momento do sorteio Gacha.
 * Não depende de JPA — é o contrato entre a camada de aplicação e o domínio.
 */
public record TaskSnapshot(
    UUID id,
    String title,
    Element elementType,
    int baseWeight,
    LocalDate lastCompletedDate // null = nunca foi completada
) {}
