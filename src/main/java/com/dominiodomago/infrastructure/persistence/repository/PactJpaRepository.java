package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.PactEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PactJpaRepository extends JpaRepository<PactEntity, UUID> {

    boolean existsByUserId1AndUserId2(UUID userId1, UUID userId2);
}
