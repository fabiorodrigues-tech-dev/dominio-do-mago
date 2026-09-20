package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class TaskEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "element_type", nullable = false, length = 20)
    private String elementType;

    @Column(name = "base_weight", nullable = false)
    private int baseWeight = 1;

    @Column(name = "last_completed_at")
    private OffsetDateTime lastCompletedAt;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    protected TaskEntity() {
        // JPA
    }

    public TaskEntity(UUID userId, String title, String elementType, int baseWeight) {
        this.userId = userId;
        this.title = title;
        this.elementType = elementType;
        this.baseWeight = baseWeight;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getElementType() { return elementType; }
    public int getBaseWeight() { return baseWeight; }
    public OffsetDateTime getLastCompletedAt() { return lastCompletedAt; }
    public void setLastCompletedAt(OffsetDateTime lastCompletedAt) { this.lastCompletedAt = lastCompletedAt; }
    public boolean isActive() { return active; }
}
