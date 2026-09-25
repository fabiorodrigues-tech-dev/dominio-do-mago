package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.DailyAstroStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DailyAstroStateRepository extends JpaRepository<DailyAstroStateEntity, String> {
    Optional<DailyAstroStateEntity> findByDate(String date);
}
