package com.dominiodomago.domain.service.tools;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.infrastructure.persistence.entity.TimeBlockEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.TimeBlockRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TimeBlockingService {

    private static final Logger log = LoggerFactory.getLogger(TimeBlockingService.class);

    private final TimeBlockRepository timeBlockRepository;
    private final UserJpaRepository userJpaRepository;

    public TimeBlockingService(TimeBlockRepository timeBlockRepository, UserJpaRepository userJpaRepository) {
        this.timeBlockRepository = timeBlockRepository;
        this.userJpaRepository = userJpaRepository;
    }

    /**
     * Agenda um novo evento ou bloco de tempo na base de dados para o usuário especificado.
     *
     * @param user  Entidade do utilizador Mago
     * @param title Nome ou descrição do compromisso/ritual
     * @param start Data e hora de início
     * @param end   Data e hora de término
     * @return A entidade TimeBlockEntity persistida
     */
    @Transactional
    public TimeBlockEntity scheduleEvent(UserEntity user, String title, LocalDateTime start, LocalDateTime end) {
        UserEntity targetUser = user != null ? user : resolveCurrentUser();
        if (targetUser == null) {
            throw new IllegalStateException("Nenhum Mago autenticado para registrar o bloco de tempo.");
        }

        String validTitle = (title != null && !title.isBlank()) ? title.trim() : "Compromisso Arcano";
        LocalDateTime validStart = start != null ? start : LocalDateTime.now();
        LocalDateTime validEnd = (end != null && end.isAfter(validStart)) ? end : validStart.plusHours(1);

        // Verificação de idempotência: se já existir evento sobreposto para o utilizador, atualiza
        List<TimeBlockEntity> overlapping = timeBlockRepository.findOverlappingEvents(targetUser.getId(), validStart, validEnd);
        if (!overlapping.isEmpty()) {
            TimeBlockEntity existing = overlapping.get(0);
            log.info("🔄 [TimeBlockingService] Evento sobreposto detectado (ID: {}). Atualizando título de '{}' para '{}' e horários para {} - {}",
                    existing.getId(), existing.getTitle(), validTitle, validStart, validEnd);
            existing.setTitle(validTitle);
            existing.setStartTime(validStart);
            existing.setEndTime(validEnd);
            return timeBlockRepository.save(existing);
        }

        TimeBlockEntity timeBlock = new TimeBlockEntity(targetUser, validTitle, validStart, validEnd);
        TimeBlockEntity saved = timeBlockRepository.save(timeBlock);

        log.info("⏰ [TimeBlockingService] Bloco agendado: '{}' de {} até {} para usuário {}",
                saved.getTitle(), saved.getStartTime(), saved.getEndTime(), targetUser.getEmail());

        return saved;
    }

    /**
     * Consulta os compromissos agendados de um usuário para uma determinada data.
     *
     * @param user Entidade do utilizador Mago
     * @param date Data da consulta
     * @return String formatada com os blocos de tempo encontrados (Ex: "14:00 às 15:00 - Ritual de Foco")
     */
    @Transactional(readOnly = true)
    public String getUpcomingEvents(UserEntity user, LocalDate date) {
        UserEntity targetUser = user != null ? user : resolveCurrentUser();
        if (targetUser == null) {
            return "Erro: Mago não identificado no plano astral.";
        }

        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(LocalTime.MAX);

        List<TimeBlockEntity> blocks = timeBlockRepository
                .findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(targetUser.getId(), startOfDay, endOfDay);

        if (blocks.isEmpty()) {
            return String.format("Nenhum compromisso agendado para %s. A agenda do Mago está livre.",
                    targetDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        String formattedEvents = blocks.stream()
                .map(b -> String.format("%s às %s - %s",
                        b.getStartTime().format(timeFormatter),
                        b.getEndTime().format(timeFormatter),
                        b.getTitle()))
                .collect(Collectors.joining("\n"));

        log.info("📅 [TimeBlockingService] Retornados {} eventos para o dia {}", blocks.size(), targetDate);
        return String.format("Eventos agendados para %s:\n%s",
                targetDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), formattedEvents);
    }

    /**
     * Resolve o utilizador autenticado a partir do SecurityContext ou do Mago Mestre padrão.
     */
    public UserEntity resolveCurrentUser() {
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
                .orElseGet(() -> userJpaRepository.findAll().stream().findFirst().orElse(null));
    }

    /**
     * Utilitário para converter string de data flexível para LocalDate.
     */
    public LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDate.now();
        }

        String lower = dateStr.trim().toLowerCase();
        if (lower.contains("hoje") || lower.contains("today")) {
            return LocalDate.now();
        }
        if (lower.contains("amanh") || lower.contains("tomorrow")) {
            return LocalDate.now().plusDays(1);
        }

        try {
            return LocalDate.parse(dateStr.trim());
        } catch (Exception ignored) {}

        try {
            return LocalDate.parse(dateStr.trim(), DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception ignored) {}

        return LocalDate.now();
    }

    /**
     * Utilitário para converter string de data e hora para LocalDateTime.
     */
    public LocalDateTime parseDateTime(String dateTimeStr, LocalDate referenceDate) {
        LocalDate baseDate = referenceDate != null ? referenceDate : LocalDate.now();
        if (dateTimeStr == null || dateTimeStr.isBlank()) {
            return baseDate.atTime(12, 0);
        }

        String trimmed = dateTimeStr.trim();

        // 1. Tenta formato ISO direto (ex: 2026-09-20T14:00:00 ou 2026-09-20T14:00)
        try {
            return LocalDateTime.parse(trimmed);
        } catch (Exception ignored) {}

        // 2. Tenta formato com espaço substituído por T (ex: 2026-09-20 14:00)
        try {
            return LocalDateTime.parse(trimmed.replace(" ", "T"));
        } catch (Exception ignored) {}

        // 3. Extrai apenas hora:minuto (ex: "14:00", "15:30", "às 18:00")
        Pattern timePattern = Pattern.compile("(\\d{1,2}):(\\d{2})");
        Matcher matcher = timePattern.matcher(trimmed);
        if (matcher.find()) {
            int hour = Integer.parseInt(matcher.group(1));
            int minute = Integer.parseInt(matcher.group(2));
            if (trimmed.toLowerCase().contains("amanh")) {
                baseDate = LocalDate.now().plusDays(1);
            }
            return baseDate.atTime(hour, minute);
        }

        return baseDate.atTime(12, 0);
    }
}
