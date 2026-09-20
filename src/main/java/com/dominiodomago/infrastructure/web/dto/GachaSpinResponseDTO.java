package com.dominiodomago.infrastructure.web.dto;

import com.dominiodomago.domain.service.GachaAlgorithmService.TaskCandidate;

public record GachaSpinResponseDTO(String taskId, String title, int dynamicWeight) {
    public static GachaSpinResponseDTO from(TaskCandidate candidate) {
        return new GachaSpinResponseDTO(candidate.id(), candidate.title(), candidate.dynamicWeight());
    }
}
