package com.dominiodomago.domain.service.tools;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.dominiodomago.infrastructure.persistence.entity.TimeBlockEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.TimeBlockRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class TimeBlockingServiceTest {

    @Mock
    private TimeBlockRepository timeBlockRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    private TimeBlockingService timeBlockingService;

    @BeforeEach
    void setUp() {
        timeBlockingService = new TimeBlockingService(timeBlockRepository, userJpaRepository);
    }

    @Test
    @DisplayName("Deve agendar evento persistindo na base de dados com datas corretas")
    void shouldScheduleEventSuccessfully() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        LocalDateTime start = LocalDateTime.of(2026, 9, 20, 14, 0);
        LocalDateTime end = LocalDateTime.of(2026, 9, 20, 15, 0);

        when(timeBlockRepository.save(any(TimeBlockEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TimeBlockEntity result = timeBlockingService.scheduleEvent(user, "Ritual de Foco", start, end);

        assertNotNull(result);
        assertEquals("Ritual de Foco", result.getTitle());
        assertEquals(start, result.getStartTime());
        assertEquals(end, result.getEndTime());
        assertFalse(result.isCompleted());

        ArgumentCaptor<TimeBlockEntity> captor = ArgumentCaptor.forClass(TimeBlockEntity.class);
        verify(timeBlockRepository, times(1)).save(captor.capture());
        assertEquals("Ritual de Foco", captor.getValue().getTitle());
    }

    @Test
    @DisplayName("Deve atualizar evento existente em vez de duplicar quando houver sobreposição de horário")
    void shouldUpdateExistingEventWhenOverlappingEventExists() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        LocalDateTime start = LocalDateTime.of(2026, 9, 20, 14, 0);
        LocalDateTime end = LocalDateTime.of(2026, 9, 20, 15, 0);

        TimeBlockEntity existing = new TimeBlockEntity(user, "Evento Antigo", start, end);

        when(timeBlockRepository.findOverlappingEvents(any(), any(), any()))
                .thenReturn(List.of(existing));
        when(timeBlockRepository.save(any(TimeBlockEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TimeBlockEntity result = timeBlockingService.scheduleEvent(user, "Novo Ritual Atualizado", start, end);

        assertNotNull(result);
        assertEquals("Novo Ritual Atualizado", result.getTitle());
        assertSame(existing, result);
        verify(timeBlockRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("Deve retornar mensagem de agenda vazia quando não existirem blocos no dia")
    void shouldReturnEmptyMessageWhenNoEvents() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        LocalDate date = LocalDate.of(2026, 9, 20);

        when(timeBlockRepository.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        String result = timeBlockingService.getUpcomingEvents(user, date);

        assertTrue(result.contains("Nenhum compromisso agendado"));
        assertTrue(result.contains("agenda do Mago está livre"));
    }

    @Test
    @DisplayName("Deve formatar eventos do dia no formato especificado 'HH:mm às HH:mm - Título'")
    void shouldFormatUpcomingEventsCorrectly() {
        UserEntity user = new UserEntity("Mago", "mago@reino.com", "hash");
        LocalDate date = LocalDate.of(2026, 9, 20);

        TimeBlockEntity b1 = new TimeBlockEntity(user, "Ritual de Foco",
                LocalDateTime.of(2026, 9, 20, 14, 0),
                LocalDateTime.of(2026, 9, 20, 15, 0));

        TimeBlockEntity b2 = new TimeBlockEntity(user, "Revisão Arcana",
                LocalDateTime.of(2026, 9, 20, 16, 30),
                LocalDateTime.of(2026, 9, 20, 17, 30));

        when(timeBlockRepository.findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(any(), any(), any()))
                .thenReturn(List.of(b1, b2));

        String result = timeBlockingService.getUpcomingEvents(user, date);

        assertTrue(result.contains("14:00 às 15:00 - Ritual de Foco"));
        assertTrue(result.contains("16:30 às 17:30 - Revisão Arcana"));
    }
}
