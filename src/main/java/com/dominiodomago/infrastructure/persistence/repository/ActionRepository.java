package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActionRepository extends JpaRepository<ActionEntity, String> {
    List<ActionEntity> findByUserId(UUID userId);
    List<ActionEntity> findByAreaId(String areaId);
    List<ActionEntity> findByControlledByRotationId(String controlledByRotationId);
    List<ActionEntity> findByRecurrenceEnabledTrue();
}
