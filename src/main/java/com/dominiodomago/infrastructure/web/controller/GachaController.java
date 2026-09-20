package com.dominiodomago.infrastructure.web.controller;

import com.dominiodomago.application.port.in.SpinGachaUseCase;
import com.dominiodomago.domain.service.GachaAlgorithmService.TaskCandidate;
import com.dominiodomago.infrastructure.web.dto.GachaSpinResponseDTO;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/{userId}/gacha")
public class GachaController {

    private final SpinGachaUseCase spinGachaUseCase;

    public GachaController(SpinGachaUseCase spinGachaUseCase) {
        this.spinGachaUseCase = spinGachaUseCase;
    }

    @PostMapping("/spin")
    public ResponseEntity<GachaSpinResponseDTO> spin(@PathVariable UUID userId) {
        TaskCandidate selected = spinGachaUseCase.spinForUser(userId);
        return ResponseEntity.ok(GachaSpinResponseDTO.from(selected));
    }
}
