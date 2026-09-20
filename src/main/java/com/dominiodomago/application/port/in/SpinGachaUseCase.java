package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.service.GachaAlgorithmService.TaskCandidate;
import java.util.UUID;

public interface SpinGachaUseCase {
    TaskCandidate spinForUser(UUID userId);
}
