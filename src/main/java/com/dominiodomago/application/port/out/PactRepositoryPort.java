package com.dominiodomago.application.port.out;

import com.dominiodomago.domain.model.PactStatus;
import java.util.Optional;
import java.util.UUID;

public interface PactRepositoryPort {

    boolean existsBetween(UUID userIdA, UUID userIdB);

    UUID createPact(UUID userId1, UUID userId2, PactStatus status);

    Optional<PactStatus> findStatus(UUID pactId);

    void updateStatus(UUID pactId, PactStatus status);
}
