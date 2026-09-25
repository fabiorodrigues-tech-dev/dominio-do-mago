package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.HabitRotationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRotationRepository extends JpaRepository<HabitRotationEntity, String> {
    List<HabitRotationEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
}
