package com.dominiodomago.domain.service;

import java.util.List;
import java.util.random.RandomGenerator;

public class GachaAlgorithmService {

    public record TaskCandidate(String id, String title, int dynamicWeight) {}

    private final RandomGenerator random; // Permite Mocking nos testes!

    public GachaAlgorithmService(RandomGenerator random) {
        this.random = random;
    }

    public TaskCandidate spin(List<TaskCandidate> tasks) {
        if (tasks == null || tasks.isEmpty()) return null;

        int totalWeight = tasks.stream().mapToInt(TaskCandidate::dynamicWeight).sum();
        double target = random.nextDouble() * totalWeight;

        for (TaskCandidate task : tasks) {
            target -= task.dynamicWeight();
            if (target <= 0) {
                return task;
            }
        }
        return tasks.get(tasks.size() - 1); // Fallback de segurança
    }
}
