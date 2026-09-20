package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.TimeBlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimeBlockRepository extends JpaRepository<TimeBlockEntity, UUID> {

    List<TimeBlockEntity> findByUserIdAndStartTimeBetween(UUID userId, LocalDateTime start, LocalDateTime end);

    List<TimeBlockEntity> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(UUID userId, LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM TimeBlockEntity t WHERE t.user.id = :userId AND t.startTime < :endTime AND t.endTime > :startTime ORDER BY t.startTime ASC")
    List<TimeBlockEntity> findOverlappingEvents(
            @org.springframework.data.repository.query.Param("userId") UUID userId,
            @org.springframework.data.repository.query.Param("startTime") LocalDateTime startTime,
            @org.springframework.data.repository.query.Param("endTime") LocalDateTime endTime
    );
}
