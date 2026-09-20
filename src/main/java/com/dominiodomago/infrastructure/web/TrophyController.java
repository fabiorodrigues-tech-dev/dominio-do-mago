package com.dominiodomago.infrastructure.web;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.infrastructure.persistence.entity.TrophyEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.TrophyRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trophies")
public class TrophyController {

    private static final Logger log = LoggerFactory.getLogger(TrophyController.class);

    private final TrophyRepository trophyRepository;
    private final UserJpaRepository userJpaRepository;
    private final GamificationEngineService gamificationEngineService;

    public TrophyController(TrophyRepository trophyRepository,
                            UserJpaRepository userJpaRepository,
                            GamificationEngineService gamificationEngineService) {
        this.trophyRepository = trophyRepository;
        this.userJpaRepository = userJpaRepository;
        this.gamificationEngineService = gamificationEngineService;
    }

    public record TrophyResponse(
            UUID id,
            String title,
            String description,
            String tier,
            String iconType,
            LocalDateTime unlockedAt
    ) {
        public static TrophyResponse fromEntity(TrophyEntity entity) {
            return new TrophyResponse(
                    entity.getId(),
                    entity.getTitle(),
                    entity.getDescription(),
                    entity.getTier(),
                    entity.getIconType(),
                    entity.getUnlockedAt()
            );
        }
    }

    @GetMapping("/my-trophies")
    public ResponseEntity<List<TrophyResponse>> getMyTrophies() {
        UserEntity user = resolveCurrentUserEntity();
        if (user == null) {
            log.warn("Nenhum Mago autenticado para recuperar galeria de troféus.");
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Garante que troféus acumulados por XP sejam verificados e concedidos
        gamificationEngineService.checkAndUnlockTrophies(user);

        List<TrophyEntity> trophies = trophyRepository.findByUserIdOrderByUnlockedAtDesc(user.getId());
        List<TrophyResponse> response = trophies.stream()
                .map(TrophyResponse::fromEntity)
                .toList();

        log.info("🏆 [TrophyController] Retornados {} troféus para o Mago {}", response.size(), user.getUsername());
        return ResponseEntity.ok(response);
    }

    private UserEntity resolveCurrentUserEntity() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                if (auth.getPrincipal() instanceof User u) {
                    return userJpaRepository.findById(u.getId()).orElse(null);
                }
                if (auth.getName() != null) {
                    var byUsername = userJpaRepository.findByUsername(auth.getName());
                    if (byUsername.isPresent()) return byUsername.get();
                    var byEmail = userJpaRepository.findByEmail(auth.getName());
                    if (byEmail.isPresent()) return byEmail.get();
                }
            }
        } catch (Exception ignored) {}

        return userJpaRepository.findByEmail("fabioandre777@gmail.com")
                .orElse(null);
    }
}
