package com.dominiodomago.infrastructure.web.controller;

import com.dominiodomago.application.port.in.RegisterActivityUseCase;
import com.dominiodomago.domain.model.StreakResult;
import com.dominiodomago.infrastructure.web.dto.StreakResponseDTO;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/{userId}/streak")
public class StreakController {

    private final RegisterActivityUseCase registerActivityUseCase;

    public StreakController(RegisterActivityUseCase registerActivityUseCase) {
        this.registerActivityUseCase = registerActivityUseCase;
    }

    @PostMapping("/register-activity")
    public ResponseEntity<StreakResponseDTO> registerActivity(@PathVariable UUID userId) {
        StreakResult result = registerActivityUseCase.registerActivity(userId);
        return ResponseEntity.ok(StreakResponseDTO.from(result));
    }
}
