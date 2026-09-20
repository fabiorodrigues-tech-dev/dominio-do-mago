package com.dominiodomago.domain.service.tools;

import com.dominiodomago.domain.model.Task;
import com.dominiodomago.domain.model.TaskRepository;
import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.model.UserRepository;
import com.dominiodomago.domain.service.AuraCalculatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TaskXpToolService {

    private static final Logger log = LoggerFactory.getLogger(TaskXpToolService.class);

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuraCalculatorService auraCalculatorService;
    private final com.dominiodomago.domain.service.GamificationEngineService gamificationEngineService;
    private final com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository userJpaRepository;

    public TaskXpToolService(TaskRepository taskRepository,
                             UserRepository userRepository,
                             AuraCalculatorService auraCalculatorService,
                             com.dominiodomago.domain.service.GamificationEngineService gamificationEngineService,
                             com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository userJpaRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.auraCalculatorService = auraCalculatorService;
        this.gamificationEngineService = gamificationEngineService;
        this.userJpaRepository = userJpaRepository;
    }

    /**
     * Registra a conclusão de um ritual arcano, salva no histórico de tarefas
     * e credita XP ao elemento correspondente e ao XP Global do Mago.
     *
     * @param taskTitle Nome ou descrição do ritual executado (ex: "Treino de Calistenia")
     * @param element   Elemento arcano associado (Fogo, Água, Terra, Ar)
     * @param xpAmount  Quantidade de XP a ser concedida (ex: 50)
     * @return Mensagem de confirmação detalhando o XP ganho e o estado da Aura.
     */
    @Transactional
    public String completeRitualAndAwardXp(String taskTitle, String element, int xpAmount) {
        User user = resolveCurrentUser();
        if (user == null) {
            log.error("Nenhum usuário encontrado para creditar ritual!");
            return "Erro: Mago não identificado no plano astral.";
        }

        if (user.getEnergy() <= 0) {
            log.warn("Mago {} tentou ganhar XP, mas está EXAUSTO (Energia = 0).", user.getEmail());
            return "⚠️ O Mago está EXAUSTO (Energia = 0). Você não pode ganhar XP até realizar uma ação de recarga (ex: dormir, meditar, alimentação). Use a ferramenta rechargeEnergyTool primeiro.";
        }

        int effectiveXp = xpAmount > 0 ? xpAmount : 50;
        String normalizedElement = normalizeElement(element);
        String finalTitle = (taskTitle != null && !taskTitle.isBlank()) ? taskTitle.trim() : "Ritual do Mago";

        // 1. Cria a tarefa no banco marcada como concluída
        Task task = new Task(user.getId(), finalTitle, "ritual", normalizedElement.toLowerCase(), true, effectiveXp);
        taskRepository.save(task);

        // 2. Credita o XP ao elemento correspondente
        switch (normalizedElement) {
            case "Fogo" -> user.setFireXp(user.getFireXp() + effectiveXp);
            case "Água" -> user.setWaterXp(user.getWaterXp() + effectiveXp);
            case "Terra" -> user.setEarthXp(user.getEarthXp() + effectiveXp);
            case "Ar" -> user.setAirXp(user.getAirXp() + effectiveXp);
        }

        // 3. Incrementa XP Global e recalcula Aura
        int currentGlobalXp = user.getTotalTrophyPoints() != null ? user.getTotalTrophyPoints() : 0;
        int newGlobalXp = currentGlobalXp + effectiveXp;
        user.setTotalTrophyPoints(newGlobalXp);
        user.setLastActivityDate(LocalDateTime.now());

        double newAuraRadius = auraCalculatorService.calculateAuraRadius(newGlobalXp);
        int newArcaneLevel = Math.min(5, Math.max(1, (newGlobalXp / 500) + 1));
        user.setArcaneLevel(newArcaneLevel);

        userRepository.save(user);

        // Desbloqueia troféus caso marcos de XP sejam atingidos
        userJpaRepository.findById(user.getId()).ifPresent(gamificationEngineService::checkAndUnlockTrophies);

        log.info("🧙‍♂️ [TaskXpToolService] Ritual '{}' concluído por {}. +{} XP concedido a {}. Novo XP Global: {}, Nível: {}, Raio Aura: {}",
                finalTitle, user.getEmail(), effectiveXp, normalizedElement, newGlobalXp, newArcaneLevel, newAuraRadius);

        return String.format(
                "⚡ [Ritual Arcano Concluído]: '%s' forjado com maestria! Concedido +%d XP ao elemento %s. XP Global: %d | Nível Arcano: %d | Raio da Aura: %.1fm",
                finalTitle, effectiveXp, normalizedElement, newGlobalXp, newArcaneLevel, newAuraRadius
        );
    }

    /**
     * Resolve o usuário atual logado via Spring Security ou recorre ao Mago Mestre padrão.
     */
    private User resolveCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User u) {
                return userRepository.findById(u.getId()).orElse(u);
            }
        } catch (Exception ignored) {}

        return userRepository.findByEmail("fabioandre777@gmail.com")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
    }

    /**
     * Normaliza as variações do nome do elemento arcano.
     */
    public String normalizeElement(String element) {
        if (element == null || element.isBlank()) return "Fogo";
        String lower = element.toLowerCase();
        if (lower.contains("fogo") || lower.contains("fisic") || lower.contains("foco") || lower.contains("forca") || lower.contains("trein")) {
            return "Fogo";
        }
        if (lower.contains("agu") || lower.contains("água") || lower.contains("emoc") || lower.contains("fluid") || lower.contains("medit")) {
            return "Água";
        }
        if (lower.contains("terr") || lower.contains("rotin") || lower.contains("financ") || lower.contains("organiz")) {
            return "Terra";
        }
        if (lower.contains("ar") || lower.contains("estud") || lower.contains("intelect") || lower.contains("leitur") || lower.contains("conhec")) {
            return "Ar";
        }
        return "Fogo";
    }
}
