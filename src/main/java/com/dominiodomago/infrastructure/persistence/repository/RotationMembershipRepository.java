package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.RotationMembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RotationMembershipRepository extends JpaRepository<RotationMembershipEntity, String> {
    List<RotationMembershipEntity> findByRotationIdOrderByPositionAsc(String rotationId);
    Optional<RotationMembershipEntity> findByRotationIdAndHabitId(String rotationId, String habitId);
    Optional<RotationMembershipEntity> findByRotationIdAndPosition(String rotationId, Integer position);
    void deleteByRotationId(String rotationId);
}
