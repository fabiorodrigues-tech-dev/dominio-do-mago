package com.dominiodomago.application.port.out;

import java.util.UUID;

public interface ManaLikeRepositoryPort {

    boolean alreadyLiked(UUID likerId, UUID profileOwnerId);

    void save(UUID likerId, UUID profileOwnerId);
}
