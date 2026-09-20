package com.dominiodomago.infrastructure.web;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.infrastructure.persistence.entity.TimeBlockEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.TimeBlockRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/time-blocks")
public class TimeBlockController {

    private static final Logger log = LoggerFactory.getLogger(TimeBlockController.class);

    private final TimeBlockRepository timeBlockRepository;
    private final UserJpaRepository userJpaRepository;

    public TimeBlockController(TimeBlockRepository timeBlockRepository, UserJpaRepository userJpaRepository) {
        this.timeBlockRepository = timeBlockRepository;
        this.userJpaRepository = userJpaRepository;
    }

    public record TimeBlockResponse(
            UUID id,
            String title,
            LocalDateTime startTime,
            LocalDateTime endTime,
            boolean isCompleted
    ) {
        public static TimeBlockResponse fromEntity(TimeBlockEntity entity) {
            return new TimeBlockResponse(
                    entity.getId(),
                    entity.getTitle(),
                    entity.getStartTime(),
                    entity.getEndTime(),
                    entity.isCompleted()
            );
        }
    }

    @GetMapping("/today")
    public ResponseEntity<List<TimeBlockResponse>> getTodayTimeBlocks() {
        UUID userId = resolveCurrentUserId();
        if (userId == null) {
            log.warn("Nenhum usuário identificado para consulta do Quadro Temporal de hoje.");
            return ResponseEntity.ok(Collections.emptyList());
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<TimeBlockEntity> blocks = timeBlockRepository
                .findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(userId, startOfDay, endOfDay);

        List<TimeBlockResponse> response = blocks.stream()
                .map(TimeBlockResponse::fromEntity)
                .toList();

        log.info("📅 [TimeBlockController] Retornados {} blocos temporais de hoje para o usuário {}", response.size(), userId);
        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/complete")
    public ResponseEntity<?> completeTimeBlock(@org.springframework.web.bind.annotation.PathVariable("id") UUID id) {
        UUID userId = resolveCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Mago não autenticado no plano astral."));
        }

        java.util.Optional<TimeBlockEntity> optionalBlock = timeBlockRepository.findById(id);
        if (optionalBlock.isEmpty()) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Bloco de tempo não encontrado."));
        }

        TimeBlockEntity block = optionalBlock.get();
        if (block.getUser() != null && !block.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body(java.util.Map.of("message", "Este bloco de tempo não pertence ao Mago atual."));
        }

        block.setCompleted(true);
        timeBlockRepository.save(block);

        log.info("✨ [TimeBlockController] Bloco de tempo '{}' ({}) concluído com sucesso pelo Mago!", block.getTitle(), id);
        return ResponseEntity.ok(java.util.Map.of("message", "Bloco de tempo concluído!", "id", id.toString()));
    }

    private UUID resolveCurrentUserId() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                if (auth.getPrincipal() instanceof User u) {
                    return u.getId();
                }
                if (auth.getName() != null) {
                    var byUsername = userJpaRepository.findByUsername(auth.getName());
                    if (byUsername.isPresent()) return byUsername.get().getId();
                    var byEmail = userJpaRepository.findByEmail(auth.getName());
                    if (byEmail.isPresent()) return byEmail.get().getId();
                }
            }
        } catch (Exception ignored) {}

        return userJpaRepository.findByEmail("fabioandre777@gmail.com")
                .map(UserEntity::getId)
                .orElse(null);
    }
}
