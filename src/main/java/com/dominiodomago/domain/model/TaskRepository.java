package com.dominiodomago.domain.model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByUserIdAndIsCompletedFalse(UUID userId);
    List<Task> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Task> findByUserIdAndElement(UUID userId, String element);
}
