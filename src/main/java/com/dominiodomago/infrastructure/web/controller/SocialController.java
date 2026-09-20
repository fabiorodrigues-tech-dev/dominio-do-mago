package com.dominiodomago.infrastructure.web.controller;

import com.dominiodomago.application.port.in.SocialUseCase;
import com.dominiodomago.infrastructure.web.dto.ManaLikeRequestDTO;
import com.dominiodomago.infrastructure.web.dto.PactRequestDTO;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/social")
public class SocialController {

    private final SocialUseCase socialUseCase;

    public SocialController(SocialUseCase socialUseCase) {
        this.socialUseCase = socialUseCase;
    }

    @PostMapping("/pacts")
    public ResponseEntity<Map<String, UUID>> sendPactRequest(@Valid @RequestBody PactRequestDTO body) {
        UUID pactId = socialUseCase.sendPactRequest(body.requesterId(), body.targetId());
        return ResponseEntity.ok(Map.of("pactId", pactId));
    }

    @PostMapping("/pacts/{pactId}/accept")
    public ResponseEntity<Void> acceptPact(@PathVariable UUID pactId, @RequestParam UUID accepterId) {
        socialUseCase.acceptPact(pactId, accepterId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mana-likes")
    public ResponseEntity<Void> likeProfile(@Valid @RequestBody ManaLikeRequestDTO body) {
        socialUseCase.likeProfile(body.likerId(), body.profileOwnerId());
        return ResponseEntity.noContent().build();
    }
}
