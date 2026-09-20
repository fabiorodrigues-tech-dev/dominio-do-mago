package com.dominiodomago.infrastructure.persistence.adapter;

import com.dominiodomago.application.port.out.TaskRepositoryPort;
import com.dominiodomago.domain.model.Element;
import com.dominiodomago.domain.model.TaskSnapshot;
import com.dominiodomago.infrastructure.persistence.entity.TaskEntity;
import com.dominiodomago.infrastructure.persistence.repository.TaskJpaRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TaskRepositoryAdapter implements TaskRepositoryPort {

    private final TaskJpaRepository taskJpaRepository;

    public TaskRepositoryAdapter(TaskJpaRepository taskJpaRepository) {
        this.taskJpaRepository = taskJpaRepository;
    }

    @Override
    public List<TaskSnapshot> findActiveTasksByUser(UUID userId) {
        return taskJpaRepository.findByUserIdAndActiveTrue(userId).stream()
            .map(this::toSnapshot)
            .toList();
    }

    @Override
    public void markCompleted(UUID taskId, LocalDate completionDate) {
        TaskEntity entity = taskJpaRepository.findById(taskId)
            .orElseThrow(() -> new NoSuchElementException("Tarefa não encontrada: " + taskId));
        entity.setLastCompletedAt(completionDate.atStartOfDay().atOffset(ZoneOffset.UTC));
        taskJpaRepository.save(entity);
    }

    private TaskSnapshot toSnapshot(TaskEntity entity) {
        OffsetDateTime lastCompletedAt = entity.getLastCompletedAt();
        return new TaskSnapshot(
            entity.getId(),
            entity.getTitle(),
            Element.valueOf(entity.getElementType().toUpperCase()),
            entity.getBaseWeight(),
            lastCompletedAt != null ? lastCompletedAt.toLocalDate() : null
        );
    }
}
