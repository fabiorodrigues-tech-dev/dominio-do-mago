package com.dominiodomago.domain.service.ai.tools;

import com.dominiodomago.domain.model.Task;
import com.dominiodomago.domain.model.TaskRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class ConselheiroTools {

    private final TaskRepository taskRepository;

    public ConselheiroTools(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public record CreateTaskRequest(UUID userId, String title, String type) {}
    public record UserIdRequest(UUID userId) {}

    @Bean
    @Description("Cria e salva uma nova tarefa (hábito, diária ou todo) para o usuário no banco de dados.")
    public Function<CreateTaskRequest, String> createTask() {
        return request -> {
            Task task = new Task(request.userId(), request.title(), request.type());
            taskRepository.save(task);
            return "Tarefa '" + request.title() + "' do tipo '" + request.type() + "' criada com sucesso!";
        };
    }

    @Bean
    @Description("Lista todas as tarefas pendentes atuais do usuário no banco de dados para ajudar na organização.")
    public Function<UserIdRequest, String> listPendingTasks() {
        return request -> {
            List<Task> pendingTasks = taskRepository.findByUserIdAndIsCompletedFalse(request.userId());
            
            if (pendingTasks.isEmpty()) {
                return "O usuário não possui nenhuma tarefa pendente no momento.";
            }
            
            return pendingTasks.stream()
                    .map(t -> String.format("- [%s] %s (Prioridade: %d)", t.getType(), t.getTitle(), t.getPriorityWeight()))
                    .collect(Collectors.joining("\n", "Tarefas Pendentes:\n", ""));
        };
    }
}
