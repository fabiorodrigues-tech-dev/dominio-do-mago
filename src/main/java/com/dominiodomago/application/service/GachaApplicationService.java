package com.dominiodomago.application.service;

import com.dominiodomago.application.port.in.SpinGachaUseCase;
import com.dominiodomago.application.port.out.TaskRepositoryPort;
import com.dominiodomago.domain.model.TaskSnapshot;
import com.dominiodomago.domain.service.GachaAlgorithmService;
import com.dominiodomago.domain.service.GachaAlgorithmService.TaskCandidate;
import com.dominiodomago.domain.service.PityWeightCalculator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GachaApplicationService implements SpinGachaUseCase {

    private final GachaAlgorithmService gachaAlgorithmService;
    private final PityWeightCalculator pityWeightCalculator;
    private final TaskRepositoryPort taskRepositoryPort;

    public GachaApplicationService(GachaAlgorithmService gachaAlgorithmService,
                                    PityWeightCalculator pityWeightCalculator,
                                    TaskRepositoryPort taskRepositoryPort) {
        this.gachaAlgorithmService = gachaAlgorithmService;
        this.pityWeightCalculator = pityWeightCalculator;
        this.taskRepositoryPort = taskRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public TaskCandidate spinForUser(UUID userId) {
        List<TaskSnapshot> activeTasks = taskRepositoryPort.findActiveTasksByUser(userId);

        List<TaskCandidate> candidates = activeTasks.stream()
            .map(task -> new TaskCandidate(
                task.id().toString(),
                task.title(),
                pityWeightCalculator.calculateDynamicWeight(task)
            ))
            .toList();

        TaskCandidate selected = gachaAlgorithmService.spin(candidates);
        if (selected == null) {
            throw new NoSuchElementException("Nenhuma tarefa ativa encontrada para sorteio (userId=" + userId + ")");
        }
        return selected;
    }
}
