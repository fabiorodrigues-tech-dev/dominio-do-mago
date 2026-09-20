package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.model.StreakResult;
import java.util.UUID;

public interface RegisterActivityUseCase {
    StreakResult registerActivity(UUID userId);
}
