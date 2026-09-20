package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.MissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MissionRepository extends JpaRepository<MissionEntity, UUID> {
}
