package com.dominiodomago.infrastructure.ai;

import com.dominiodomago.domain.service.tools.TimeBlockingService;
import com.dominiodomago.infrastructure.persistence.entity.TimeBlockEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.function.Function;

@Configuration
public class CalendarToolConfig {

    public record RequestAgenda(String date) {}
    public record ResponseAgenda(String events) {}

    public record RequestSchedule(String title, String startTime, String endTime) {}
    public record ResponseSchedule(String confirmation) {}

    @Bean
    @Description("Obtém os eventos e compromissos da agenda do Mago para um dia específico (ex: 'hoje', 'amanhã' ou data no formato 'YYYY-MM-DD').")
    public Function<RequestAgenda, ResponseAgenda> getAgendaTool(TimeBlockingService service) {
        return request -> {
            UserEntity user = service.resolveCurrentUser();
            LocalDate date = service.parseDate(request != null ? request.date() : null);
            String events = service.getUpcomingEvents(user, date);
            return new ResponseAgenda(events);
        };
    }

    @Bean
    @Description("Agenda um novo compromisso, ritual ou bloco de tempo na base de dados do Mago. Parâmetros: title (título do evento), startTime (data e hora de início no formato ISO YYYY-MM-DDTHH:mm:ss ou hora HH:mm), endTime (data e hora de término no formato ISO YYYY-MM-DDTHH:mm:ss ou hora HH:mm).")
    public Function<RequestSchedule, ResponseSchedule> scheduleEventTool(TimeBlockingService service) {
        return request -> {
            UserEntity user = service.resolveCurrentUser();
            LocalDate today = LocalDate.now();
            String rawStart = request != null ? request.startTime() : null;
            String rawEnd = request != null ? request.endTime() : null;

            LocalDateTime start = service.parseDateTime(rawStart, today);
            LocalDateTime end = service.parseDateTime(rawEnd, start.toLocalDate());

            if (end == null || !end.isAfter(start)) {
                end = start.plusHours(1);
            }

            String title = (request != null && request.title() != null && !request.title().isBlank())
                    ? request.title()
                    : "Compromisso Arcano";

            TimeBlockEntity block = service.scheduleEvent(user, title, start, end);

            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            String confirmation = String.format("⚡ [Agenda Arcana]: Compromisso '%s' forjado na linha do tempo para o dia %s, das %s às %s.",
                    block.getTitle(),
                    block.getStartTime().format(dateFmt),
                    block.getStartTime().format(timeFmt),
                    block.getEndTime().format(timeFmt));

            return new ResponseSchedule(confirmation);
        };
    }
}
