package com.dominiodomago.infrastructure.ai;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.service.DailyAstroStateService;
import com.dominiodomago.domain.service.GamificationEngineService;
import com.dominiodomago.domain.service.PranaService;
import com.dominiodomago.domain.service.ScoringEngineService;
import com.dominiodomago.infrastructure.persistence.entity.ActionEntity;
import com.dominiodomago.infrastructure.persistence.entity.AreaEntity;
import com.dominiodomago.infrastructure.persistence.entity.DailyAstroStateEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.ActionRepository;
import com.dominiodomago.infrastructure.persistence.repository.AreaRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;

@Configuration
public class CanonicalToolsConfig {

    private static final Logger log = LoggerFactory.getLogger(CanonicalToolsConfig.class);

    private final ActionRepository actionRepository;
    private final AreaRepository areaRepository;
    private final UserJpaRepository userJpaRepository;
    private final PranaService pranaService;
    private final ScoringEngineService scoringEngineService;
    private final DailyAstroStateService astroStateService;
    private final GamificationEngineService gamificationEngineService;

    public CanonicalToolsConfig(ActionRepository actionRepository,
                                AreaRepository areaRepository,
                                UserJpaRepository userJpaRepository,
                                PranaService pranaService,
                                ScoringEngineService scoringEngineService,
                                DailyAstroStateService astroStateService,
                                GamificationEngineService gamificationEngineService) {
        this.actionRepository = actionRepository;
        this.areaRepository = areaRepository;
        this.userJpaRepository = userJpaRepository;
        this.pranaService = pranaService;
        this.scoringEngineService = scoringEngineService;
        this.astroStateService = astroStateService;
        this.gamificationEngineService = gamificationEngineService;
    }

    // --- DTOs / Records das Ferramentas Canônicas ---

    public record CreateDraftItemRequest(String title, String description, BigDecimal baseValue, String energyType) {}
    public record DraftItemResponse(String itemId, String title, String energyType, String status, String message) {}

    public record ClassifyItemRequest(String itemId, String areaId, String taskEnergyType, Integer effortLevel, Boolean recurrenceEnabled, String recurrenceType) {}
    public record ClassifyItemResponse(String itemId, String title, String areaId, String taskEnergyType, String message) {}

    public record CompleteItemRequest(String itemIdOrTitle, Long durationMinutes, Long presenceSeconds, Integer effortLevel, List<String> secondaryAreaIds) {}
    public record CompleteItemResponse(String itemId, String title, BigDecimal finalScore, int currentPrana, boolean exhausted, String pranaMessage, Map<String, BigDecimal> areaDistribution, String message) {}

    public record QueryDailyListRequest(String filter) {}
    public record DailyItemDto(String id, String title, String areaId, String energyType, BigDecimal baseValue, boolean completed) {}
    public record DailyListResponse(int pranaLevel, boolean isExhausted, String moonPhase, String moonSign, List<DailyItemDto> items, String summary) {}

    // --- TOOL 1: create_draft_item ---

    @Bean("create_draft_item")
    @Description("Cria um novo item/hábito/tarefa em estado de rascunho no Domínio do Mago. Parâmetros: title (obrigatório), description, baseValue (padrão 10.0), energyType ('NEUTRAL', 'RESTORATIVE', 'POISON').")
    @Transactional
    public Function<CreateDraftItemRequest, DraftItemResponse> createDraftItemTool() {
        return request -> {
            UserEntity user = resolveCurrentUser();
            if (user == null) {
                return new DraftItemResponse(null, null, "NEUTRAL", "ERROR", "Mago não identificado no plano astral.");
            }

            String title = (request != null && request.title() != null && !request.title().isBlank())
                    ? request.title().trim()
                    : "Novo Hábito Arcano";

            String energyType = (request != null && request.energyType() != null && !request.energyType().isBlank())
                    ? request.energyType().toUpperCase().trim()
                    : "NEUTRAL";

            if (!List.of("NEUTRAL", "RESTORATIVE", "POISON").contains(energyType)) {
                energyType = "NEUTRAL";
            }

            BigDecimal baseVal = (request != null && request.baseValue() != null && request.baseValue().compareTo(BigDecimal.ZERO) > 0)
                    ? request.baseValue()
                    : BigDecimal.valueOf(10.00);

            String id = "act-" + UUID.randomUUID().toString().substring(0, 8);
            ActionEntity action = new ActionEntity(id, title, baseVal);
            action.setUserId(user.getId());
            action.setAreaId("area-sem-categoria");
            action.setDescription(request != null ? request.description() : "");
            action.setTaskEnergyType(energyType);
            action.setIsCompleted(false);

            actionRepository.save(action);
            log.info("📝 [Tool create_draft_item] Rascunho forjado com sucesso: ID={}, Título='{}', Energia={}",
                    id, title, energyType);

            return new DraftItemResponse(
                    id,
                    title,
                    energyType,
                    "DRAFT_CREATED",
                    String.format("Item '%s' forjado como rascunho com sucesso (ID: %s, Tipo de Energia: %s, Valor Base: %s).",
                            title, id, energyType, baseVal)
            );
        };
    }

    // --- TOOL 2: classify_item ---

    @Bean("classify_item")
    @Description("Classifica e categoriza um item existente, atribuindo área elemental (body-fire, body-water, body-earth, body-air), tipo de energia (NEUTRAL, RESTORATIVE, POISON) ou regras de recorrência.")
    @Transactional
    public Function<ClassifyItemRequest, ClassifyItemResponse> classifyItemTool() {
        return request -> {
            if (request == null || request.itemId() == null || request.itemId().isBlank()) {
                return new ClassifyItemResponse(null, null, null, null, "ID do item é obrigatório para classificação.");
            }

            UserEntity user = resolveCurrentUser();
            Optional<ActionEntity> actionOpt = actionRepository.findById(request.itemId());
            if (actionOpt.isEmpty() && user != null) {
                actionOpt = actionRepository.findFirstByUserIdAndTitleContainingIgnoreCase(user.getId(), request.itemId());
            }

            if (actionOpt.isEmpty()) {
                return new ClassifyItemResponse(request.itemId(), null, null, null,
                        "Item não encontrado no grimório para o ID ou título informado: " + request.itemId());
            }

            ActionEntity action = actionOpt.get();

            if (request.areaId() != null && !request.areaId().isBlank()) {
                action.setAreaId(request.areaId().trim());
            }

            if (request.taskEnergyType() != null && !request.taskEnergyType().isBlank()) {
                String energy = request.taskEnergyType().toUpperCase().trim();
                if (List.of("NEUTRAL", "RESTORATIVE", "POISON").contains(energy)) {
                    action.setTaskEnergyType(energy);
                }
            }

            if (request.recurrenceEnabled() != null) {
                action.setRecurrenceEnabled(request.recurrenceEnabled());
            }

            if (request.recurrenceType() != null && !request.recurrenceType().isBlank()) {
                action.setRecurrenceType(request.recurrenceType().toUpperCase().trim());
            }

            actionRepository.save(action);
            log.info("🏷️ [Tool classify_item] Item {} reclassificado: Área={}, Energia={}, Recorrência={}",
                    action.getId(), action.getAreaId(), action.getTaskEnergyType(), action.getRecurrenceType());

            return new ClassifyItemResponse(
                    action.getId(),
                    action.getTitle(),
                    action.getAreaId(),
                    action.getTaskEnergyType(),
                    String.format("Item '%s' (%s) classificado com sucesso na área '%s' com energia '%s'.",
                            action.getTitle(), action.getId(), action.getAreaId(), action.getTaskEnergyType())
            );
        };
    }

    // --- TOOL 3: complete_item com Débito/Recuperação de Prana ---

    @Bean("complete_item")
    @Description("Conclui um ritual, hábito ou tarefa, aciona o pipeline de pontuação ADR-000, debita ou recupera Prana (considerando tarefas restauradoras/venenos e exaustão) e concede XP elemental com distribuição multi-área (100/60/30).")
    @Transactional
    public Function<CompleteItemRequest, CompleteItemResponse> completeItemTool() {
        return request -> {
            UserEntity user = resolveCurrentUser();
            if (user == null) {
                return new CompleteItemResponse(null, null, BigDecimal.ZERO, 0, true, "Mago ausente", Map.of(), "Erro: Mago não identificado.");
            }

            String searchKey = (request != null && request.itemIdOrTitle() != null && !request.itemIdOrTitle().isBlank())
                    ? request.itemIdOrTitle().trim()
                    : "Ritual Instantâneo";

            // Localiza a ação existente ou forja uma ad-hoc
            Optional<ActionEntity> actionOpt = actionRepository.findById(searchKey);
            if (actionOpt.isEmpty()) {
                actionOpt = actionRepository.findFirstByUserIdAndTitleContainingIgnoreCase(user.getId(), searchKey);
            }

            ActionEntity action = actionOpt.orElseGet(() -> {
                ActionEntity adhoc = new ActionEntity("act-" + UUID.randomUUID().toString().substring(0, 8), searchKey, BigDecimal.valueOf(10.00));
                adhoc.setUserId(user.getId());
                adhoc.setAreaId("area-sem-categoria");
                adhoc.setTaskEnergyType("NEUTRAL");
                return actionRepository.save(adhoc);
            });

            // 1. Processa o Débito ou Recuperação de Prana
            PranaService.PranaTransactionResult pranaResult = pranaService.processActionPrana(user.getId(), action);

            // Se o Mago estiver em Exaustão e a ação for NEUTRAL (sem energia), bloqueia a execução
            if ("NEUTRAL".equalsIgnoreCase(action.getTaskEnergyType()) && pranaResult.delta() == 0 && pranaResult.exhausted()) {
                return new CompleteItemResponse(
                        action.getId(),
                        action.getTitle(),
                        BigDecimal.ZERO,
                        user.getPranaLevel(),
                        true,
                        pranaResult.message(),
                        Map.of(),
                        "⛔ Ação bloqueada pelo Conselho Arcano: O Mago está em EXAUSTÃO TOTAL (Prana 0). Realize rituais restauradores para recuperar Prana!"
                );
            }

            // 2. Parâmetros de Tempo e Esforço para o ScoringEngine ADR-000
            long durationMinutes = (request != null && request.durationMinutes() != null && request.durationMinutes() > 0)
                    ? request.durationMinutes()
                    : 15;
            long presenceSeconds = (request != null && request.presenceSeconds() != null && request.presenceSeconds() >= 0)
                    ? request.presenceSeconds()
                    : 30;
            int effortLevel = (request != null && request.effortLevel() != null && request.effortLevel() >= 1 && request.effortLevel() <= 5)
                    ? request.effortLevel()
                    : 1;

            List<String> areasInOrder = new ArrayList<>();
            if (action.getAreaId() != null) {
                areasInOrder.add(action.getAreaId());
            }
            if (request != null && request.secondaryAreaIds() != null) {
                for (String secId : request.secondaryAreaIds()) {
                    if (secId != null && !areasInOrder.contains(secId)) {
                        areasInOrder.add(secId);
                    }
                }
            }

            // 3. Pipeline Canônico de Pontuação ADR-000 (Sem M_streak, com Presence Bonus e Curva Agressiva)
            ScoringEngineService.MultiAreaScoreDistribution scoreDist =
                    scoringEngineService.calculateAndDistributeScore(action, user, durationMinutes, presenceSeconds, effortLevel, areasInOrder);

            // 4. Credita o XP Elemental e Recalcula Nível Arcano
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
            actionRepository.save(action);

            String confirmation = String.format("⚡ Ação '%s' concluída com glória! Pontuação Final: %s XP. %s",
                    action.getTitle(), scoreDist.finalScore(), pranaResult.message());

            log.info("🏆 [Tool complete_item] Ação {} concluída. Pontos={}, PranaAtual={}/100",
                    action.getId(), scoreDist.finalScore(), pranaResult.currentPrana());

            return new CompleteItemResponse(
                    action.getId(),
                    action.getTitle(),
                    scoreDist.finalScore(),
                    pranaResult.currentPrana(),
                    pranaResult.exhausted(),
                    pranaResult.message(),
                    scoreDist.areaDistribution(),
                    confirmation
            );
        };
    }

    // --- TOOL 4: query_daily_list ---

    @Bean("query_daily_list")
    @Description("Consulta o grimório diário de ações, hábitos e tarefas do Mago, retornando a lista de afazeres com o estado atual de Prana, nível de exaustão e fase lunar cósmica.")
    @Transactional(readOnly = true)
    public Function<QueryDailyListRequest, DailyListResponse> queryDailyListTool() {
        return request -> {
            UserEntity user = resolveCurrentUser();
            if (user == null) {
                return new DailyListResponse(0, true, "UNKNOWN", "UNKNOWN", List.of(), "Mago não identificado.");
            }

            int prana = pranaService.getPrana(user.getId());
            boolean exhausted = pranaService.isExhausted(user.getId());
            DailyAstroStateEntity astro = astroStateService.getTodayState();

            List<ActionEntity> actions = actionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

            String filter = (request != null && request.filter() != null)
                    ? request.filter().toUpperCase().trim()
                    : "ALL";

            List<DailyItemDto> dtoList = actions.stream()
                    .filter(a -> {
                        if ("PENDING".equals(filter)) return Boolean.FALSE.equals(a.getIsCompleted());
                        if ("COMPLETED".equals(filter)) return Boolean.TRUE.equals(a.getIsCompleted());
                        if ("RESTORATIVE".equals(filter)) return "RESTORATIVE".equalsIgnoreCase(a.getTaskEnergyType());
                        if ("POISON".equals(filter)) return "POISON".equalsIgnoreCase(a.getTaskEnergyType());
                        return true;
                    })
                    .map(a -> new DailyItemDto(
                            a.getId(),
                            a.getTitle(),
                            a.getAreaId(),
                            a.getTaskEnergyType(),
                            a.getBaseValue(),
                            Boolean.TRUE.equals(a.getIsCompleted())
                    ))
                    .toList();

            String summary = String.format("Grimório Diário: %d itens listados. Prana: %d/100 (%s). Céu: Lua %s em %s.",
                    dtoList.size(), prana, exhausted ? "EXAUSTO" : "DISPONÍVEL", astro.getMoonPhase(), astro.getMoonSign().toUpperCase());

            return new DailyListResponse(
                    prana,
                    exhausted,
                    astro.getMoonPhase(),
                    astro.getMoonSign(),
                    dtoList,
                    summary
            );
        };
    }

    private UserEntity resolveCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User u) {
                return userJpaRepository.findById(u.getId()).orElse(null);
            }
        } catch (Exception ignored) {}

        return userJpaRepository.findByEmail("fabioandre777@gmail.com")
                .orElseGet(() -> userJpaRepository.findAll().stream().findFirst().orElse(null));
    }
}
