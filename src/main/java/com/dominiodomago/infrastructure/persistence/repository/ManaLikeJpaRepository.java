package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.ManaLikeEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManaLikeJpaRepository extends JpaRepository<ManaLikeEntity, UUID> {

    boolean existsByLikerIdAndProfileOwnerId(UUID likerId, UUID profileOwnerId);
}
