package com.dominiodomago.infrastructure.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ManaLikeRequestDTO(
    @NotNull UUID likerId,
    @NotNull UUID profileOwnerId
) {}
