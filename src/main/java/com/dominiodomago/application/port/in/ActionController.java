package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.service.DailyAstroStateService;
import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.domain.service.PranaService;
import com.dominiodomago.domain.service.ScoringEngineService;
import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.ActionRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    private static final Logger log = LoggerFactory.getLogger(ActionController.class);

    private final ActionRepository actionRepository;
    private final UserJpaRepository userJpaRepository;
    private final PranaService pranaService;
    private final ScoringEngineService scoringEngineService;
    private final GamificationEngineService gamificationEngineService;

    public ActionController(ActionRepository actionRepository,
                            UserJpaRepository userJpaRepository,
                            PranaService pranaService,
                            ScoringEngineService scoringEngineService,
                            GamificationEngineService gamificationEngineService) {
        this.actionRepository = actionRepository;
        this.userJpaRepository = userJpaRepository;
        this.pranaService = pranaService;
        this.scoringEngineService = scoringEngineService;
        this.gamificationEngineService = gamificationEngineService;
    }

    public record CreateActionDto(
            String title,
            String description,
            String areaId,
            String taskEnergyType,
            BigDecimal baseValue,
            Boolean recurrenceEnabled,
            String recurrenceType,
            String lifecycleType
    ) {}

    public record UpdateActionDto(
            String title,
            String description,
            String areaId,
            String taskEnergyType,
            BigDecimal baseValue,
            Boolean recurrenceEnabled,
            String recurrenceType,
            String lifecycleType
    ) {}

    public record CompleteActionDto(
            Long durationMinutes,
            Long presenceSeconds,
            Integer effortLevel,
            List<String> secondaryAreaIds
    ) {}

    public record CompleteActionResponse(
            boolean success,
            ActionEntity action,
            BigDecimal finalScore,
            int currentPrana,
            boolean exhausted,
            String pranaMessage,
            String message
    ) {}

    public record PranaStatusResponse(
            int pranaLevel,
            boolean exhausted,
            String message
    ) {}

    @GetMapping
    @Transactional
    public ResponseEntity<List<ActionEntity>> getActions() {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        List<ActionEntity> actions = actionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (actions.isEmpty()) {
            actions = seedDefaultActions(user.getId());
        }

        // Filtra estritamente itens da Lista Diária com lifecycle_type IN ('ACTION', 'HABIT')
        List<ActionEntity> filtered = actions.stream()
                .filter(a -> a.getLifecycleType() == null
                        || "ACTION".equalsIgnoreCase(a.getLifecycleType())
                        || "HABIT".equalsIgnoreCase(a.getLifecycleType()))
                .toList();

        return ResponseEntity.ok(filtered);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ActionEntity> createAction(@RequestBody CreateActionDto dto) {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        String energyType = (dto.taskEnergyType() != null && !dto.taskEnergyType().isBlank())
                ? dto.taskEnergyType().toUpperCase().trim()
                : "NEUTRAL";
        if (!List.of("NEUTRAL", "RESTORATIVE", "POISON").contains(energyType)) {
            energyType = "NEUTRAL";
        }

        BigDecimal baseVal = (dto.baseValue() != null && dto.baseValue().compareTo(BigDecimal.ZERO) > 0)
                ? dto.baseValue()
                : BigDecimal.valueOf(10.00);

        String id = "act-" + UUID.randomUUID().toString().substring(0, 8);
        ActionEntity action = new ActionEntity(id, dto.title(), baseVal);
        action.setUserId(user.getId());
        action.setDescription(dto.description());
        action.setAreaId(dto.areaId() != null && !dto.areaId().isBlank() ? dto.areaId().trim() : "area-fogo");
        action.setTaskEnergyType(energyType);
        action.setRecurrenceEnabled(Boolean.TRUE.equals(dto.recurrenceEnabled()));
        action.setRecurrenceType(dto.recurrenceType() != null ? dto.recurrenceType() : (Boolean.TRUE.equals(dto.recurrenceEnabled()) ? "DAILY" : null));
        
        String lifecycle = (dto.lifecycleType() != null && !dto.lifecycleType().isBlank())
                ? dto.lifecycleType().toUpperCase().trim()
                : (Boolean.TRUE.equals(dto.recurrenceEnabled()) ? "HABIT" : "ACTION");
        action.setLifecycleType(lifecycle);
        action.setIsCompleted(false);

        ActionEntity saved = actionRepository.save(action);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ActionEntity> updateAction(@PathVariable String id, @RequestBody UpdateActionDto dto) {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<ActionEntity> actionOpt = actionRepository.findById(id);
        if (actionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ActionEntity action = actionOpt.get();
        if (dto.title() != null && !dto.title().isBlank()) {
            action.setTitle(dto.title().trim());
        }
        if (dto.description() != null) {
            action.setDescription(dto.description());
        }
        if (dto.areaId() != null && !dto.areaId().isBlank()) {
            action.setAreaId(dto.areaId().trim());
        }
        if (dto.taskEnergyType() != null && !dto.taskEnergyType().isBlank()) {
            String energyType = dto.taskEnergyType().toUpperCase().trim();
            if (List.of("NEUTRAL", "RESTORATIVE", "POISON").contains(energyType)) {
                action.setTaskEnergyType(energyType);
            }
        }
        if (dto.baseValue() != null && dto.baseValue().compareTo(BigDecimal.ZERO) > 0) {
            action.setBaseValue(dto.baseValue());
        }
        if (dto.recurrenceEnabled() != null) {
            action.setRecurrenceEnabled(dto.recurrenceEnabled());
        }
        if (dto.recurrenceType() != null) {
            action.setRecurrenceType(dto.recurrenceType());
        }
        if (dto.lifecycleType() != null && !dto.lifecycleType().isBlank()) {
            action.setLifecycleType(dto.lifecycleType().toUpperCase().trim());
        }

        ActionEntity saved = actionRepository.save(action);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteAction(@PathVariable String id) {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<ActionEntity> actionOpt = actionRepository.findById(id);
        if (actionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        actionRepository.delete(actionOpt.get());
        return ResponseEntity.ok(Map.of("success", true, "id", id, "message", "Ação excluída com sucesso."));
    }

    @PostMapping("/{id}/complete")
    @Transactional
    public ResponseEntity<?> completeAction(@PathVariable String id, @RequestBody(required = false) CompleteActionDto dto) {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<ActionEntity> actionOpt = actionRepository.findById(id);
        if (actionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ActionEntity action = actionOpt.get();

        int effortLevel = (dto != null && dto.effortLevel() != null && dto.effortLevel() >= 1 && dto.effortLevel() <= 5)
                ? dto.effortLevel()
                : 1;

        // 1. Processa Débito / Recuperação de Prana proporcional ao esforço (ADR-000: -5 a -35 ou +10 a +50)
        PranaService.PranaTransactionResult pranaResult = pranaService.processActionPrana(user.getId(), action, effortLevel);

        // Se o Mago estiver em Exaustão e a ação for NEUTRAL, bloqueia
        if ("NEUTRAL".equalsIgnoreCase(action.getTaskEnergyType()) && pranaResult.delta() == 0 && pranaResult.exhausted()) {
            return ResponseEntity.badRequest().body(new CompleteActionResponse(
                    false,
                    action,
                    BigDecimal.ZERO,
                    user.getPranaLevel(),
                    true,
                    pranaResult.message(),
                    "⛔ Ação bloqueada pelo Conselho Arcano: O Mago está em EXAUSTÃO TOTAL (Prana 0). Realize rituais restauradores para recuperar Prana!"
            ));
        }

        // 2. Parâmetros de Tempo e Esforço para o ScoringEngine ADR-000
        long durationMinutes = (dto != null && dto.durationMinutes() != null && dto.durationMinutes() > 0)
                ? dto.durationMinutes()
                : 15;
        long presenceSeconds = (dto != null && dto.presenceSeconds() != null && dto.presenceSeconds() >= 0)
                ? dto.presenceSeconds()
                : 30;

        List<String> areasInOrder = new ArrayList<>();
        if (action.getAreaId() != null) {
            areasInOrder.add(action.getAreaId());
        }
        if (dto != null && dto.secondaryAreaIds() != null) {
            for (String secId : dto.secondaryAreaIds()) {
                if (secId != null && !areasInOrder.contains(secId)) {
                    areasInOrder.add(secId);
                }
            }
        }

        // 3. Pipeline Canônico de Pontuação ADR-000
        ScoringEngineService.MultiAreaScoreDistribution scoreDist =
                scoringEngineService.calculateAndDistributeScore(action, user, durationMinutes, presenceSeconds, effortLevel, areasInOrder);

        // 4. Credita XP Elemental
        if (scoreDist.elementDistribution() != null) {
            scoreDist.elementDistribution().forEach((element, score) -> {
                int xpGained = score.intValue();
                switch (element.toLowerCase()) {
                    case "fire" -> user.setFireXp(user.getFireXp() + xpGained);
                    case "water" -> user.setWaterXp(user.getWaterXp() + xpGained);
                    case "earth" -> user.setEarthXp(user.getEarthXp() + xpGained);
                    case "air" -> user.setAirXp(user.getAirXp() + xpGained);
                }
            });
        }

        gamificationEngineService.calculateLevelUp(user);
        userJpaRepository.save(user);

        // 5. Marca a Ação como Concluída
        action.setIsCompleted(true);
        action.setLastCompletedAt(OffsetDateTime.now());
        ActionEntity updatedAction = actionRepository.save(action);

        String message = String.format("⚡ Ação '%s' concluída! +%s XP concedido. %s",
                action.getTitle(), scoreDist.finalScore(), pranaResult.message());

        return ResponseEntity.ok(new CompleteActionResponse(
                true,
                updatedAction,
                scoreDist.finalScore(),
                pranaResult.currentPrana(),
                pranaResult.exhausted(),
                pranaResult.message(),
                message
        ));
    }

    @PatchMapping("/{id}/toggle")
    @Transactional
    public ResponseEntity<?> toggleAction(@PathVariable String id) {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<ActionEntity> actionOpt = actionRepository.findById(id);
        if (actionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ActionEntity action = actionOpt.get();

        if (Boolean.TRUE.equals(action.getIsCompleted())) {
            // Desmarca a ação
            action.setIsCompleted(false);
            ActionEntity saved = actionRepository.save(action);
            int currentPrana = pranaService.getPrana(user.getId());
            boolean exhausted = pranaService.isExhausted(user.getId());
            return ResponseEntity.ok(new CompleteActionResponse(
                    true,
                    saved,
                    BigDecimal.ZERO,
                    currentPrana,
                    exhausted,
                    "Ação reaberta.",
                    "Ação desmarcada e retornada para a lista diária."
            ));
        } else {
            // Conclui a ação
            return completeAction(id, new CompleteActionDto(15L, 30L, 1, List.of()));
        }
    }

    @GetMapping("/prana")
    @Transactional(readOnly = true)
    public ResponseEntity<PranaStatusResponse> getPranaStatus() {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        int prana = pranaService.getPrana(user.getId());
        boolean exhausted = pranaService.isExhausted(user.getId());
        String msg = exhausted
                ? "💀 EXAUSTÃO ARCANA: Suas reservas de Prana esgotaram-se! Execute tarefas restauradoras para recuperar sua energia."
                : (prana >= 80 ? "✨ Fluxo Arcano Pleno (Flow State)" : "Reserva de Prana Estável");

        return ResponseEntity.ok(new PranaStatusResponse(prana, exhausted, msg));
    }

    @PostMapping("/prana/recharge")
    @Transactional
    public ResponseEntity<PranaStatusResponse> rechargePrana() {
        UserEntity user = resolveCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        var result = pranaService.rechargeToFull(user.getId());
        return ResponseEntity.ok(new PranaStatusResponse(result.currentPrana(), false, result.message()));
    }

    private UserEntity resolveCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User u) {
                return userJpaRepository.findById(u.getId()).orElse(null);
            }
        } catch (Exception e) {
            log.warn("Erro ao identificar usuário autenticado: {}", e.getMessage());
        }
        return userJpaRepository.findAll().stream().findFirst().orElse(null);
    }

    private List<ActionEntity> seedDefaultActions(UUID userId) {
        List<ActionEntity> initial = List.of(
                createInitialAction(userId, "act-fire-1", "Treino de Calistenia & Foco Ativo", "area-fogo", "RESTORATIVE", new BigDecimal("25.00"), true, "DAILY"),
                createInitialAction(userId, "act-water-1", "Meditação das Águas Profundas", "area-agua", "RESTORATIVE", new BigDecimal("20.00"), true, "DAILY"),
                createInitialAction(userId, "act-earth-1", "Planejamento Estratégico & Finanças", "area-terra", "NEUTRAL", new BigDecimal("35.00"), true, "DAILY"),
                createInitialAction(userId, "act-air-1", "Estudo de Arquitetura & Sabedoria", "area-ar", "NEUTRAL", new BigDecimal("40.00"), false, null)
        );
        return actionRepository.saveAll(initial);
    }

    private ActionEntity createInitialAction(UUID userId, String id, String title, String areaId, String energyType, BigDecimal baseVal, boolean recurrence, String recurrenceType) {
        ActionEntity a = new ActionEntity(id, title, baseVal);
        a.setUserId(userId);
        a.setAreaId(areaId);
        a.setTaskEnergyType(energyType);
        a.setRecurrenceEnabled(recurrence);
        a.setRecurrenceType(recurrenceType);
        a.setIsCompleted(false);
        return a;
    }
}
