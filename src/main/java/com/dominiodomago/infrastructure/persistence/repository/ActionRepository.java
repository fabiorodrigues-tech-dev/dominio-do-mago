package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActionRepository extends JpaRepository<ActionEntity, String> {
    List<ActionEntity> findByUserId(UUID userId);
    List<ActionEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<ActionEntity> findByUserIdAndIsCompletedFalseOrderByCreatedAtDesc(UUID userId);
    List<ActionEntity> findByAreaId(String areaId);
    List<ActionEntity> findByControlledByRotationId(String controlledByRotationId);
    List<ActionEntity> findByRecurrenceEnabledTrue();
    java.util.Optional<ActionEntity> findFirstByUserIdAndTitleContainingIgnoreCase(UUID userId, String title);
    java.util.Optional<ActionEntity> findFirstByTitleContainingIgnoreCase(String title);
}
