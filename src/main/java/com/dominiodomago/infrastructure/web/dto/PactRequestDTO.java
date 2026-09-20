package com.dominiodomago.infrastructure.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PactRequestDTO(
    @NotNull UUID requesterId,
    @NotNull UUID targetId
) {}
