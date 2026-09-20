package com.dominiodomago.application.port.out;

import com.dominiodomago.domain.model.TaskSnapshot;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaskRepositoryPort {

    List<TaskSnapshot> findActiveTasksByUser(UUID userId);

    void markCompleted(UUID taskId, LocalDate completionDate);
}
