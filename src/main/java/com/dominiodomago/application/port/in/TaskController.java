package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.model.Task;
import com.dominiodomago.domain.model.TaskRepository;
import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.service.tools.TaskXpToolService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskXpToolService taskXpToolService;

    public TaskController(TaskRepository taskRepository, TaskXpToolService taskXpToolService) {
        this.taskRepository = taskRepository;
        this.taskXpToolService = taskXpToolService;
    }

    public record CreateTaskDto(String title, String type, String element, Integer priorityWeight, Integer xpReward) {}
    public record CompleteRitualDto(String title, String element, Integer xpAmount) {}

    @GetMapping
    public ResponseEntity<List<Task>> getUserTasks() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Task> tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody CreateTaskDto dto) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String element = (dto.element() != null && !dto.element().isBlank()) ? dto.element().toLowerCase() : "fogo";
        String type = (dto.type() != null && !dto.type().isBlank()) ? dto.type() : "daily";
        int xp = (dto.xpReward() != null && dto.xpReward() > 0) ? dto.xpReward() : 50;

        Task task = new Task(user.getId(), dto.title(), type, element, false, xp);
        if (dto.priorityWeight() != null) {
            task.setPriorityWeight(dto.priorityWeight());
        }

        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleTask(@PathVariable UUID id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return taskRepository.findById(id).map(task -> {
            if (!task.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            boolean newState = !task.isCompleted();
            task.setCompleted(newState);
            taskRepository.save(task);

            // Se completou a tarefa, concede o XP correspondente
            if (newState) {
                String result = taskXpToolService.completeRitualAndAwardXp(task.getTitle(), task.getElement(), task.getXpReward());
                return ResponseEntity.ok(java.util.Map.of("task", task, "message", result));
            }

            return ResponseEntity.ok(java.util.Map.of("task", task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/complete-ritual")
    public ResponseEntity<?> completeRitual(@RequestBody CompleteRitualDto dto) {
        int xp = (dto.xpAmount() != null && dto.xpAmount() > 0) ? dto.xpAmount() : 50;
        String result = taskXpToolService.completeRitualAndAwardXp(dto.title(), dto.element(), xp);
        return ResponseEntity.ok(java.util.Map.of("message", result));
    }
}
