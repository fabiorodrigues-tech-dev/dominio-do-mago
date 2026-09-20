package com.dominiodomago.domain.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "ai_tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String type; // habit, daily, todo

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    @Column(name = "priority_weight", nullable = false)
    private int priorityWeight = 1;

    @Column(name = "element", length = 20)
    private String element = "fogo";

    @Column(name = "xp_reward")
    private Integer xpReward = 50;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public Task() {}

    public Task(UUID userId, String title, String type) {
        this.userId = userId;
        this.title = title;
        this.type = type;
        this.createdAt = java.time.LocalDateTime.now();
    }

    public Task(UUID userId, String title, String type, String element, boolean isCompleted, int xpReward) {
        this.userId = userId;
        this.title = title;
        this.type = type;
        this.element = element;
        this.isCompleted = isCompleted;
        this.xpReward = xpReward;
        this.createdAt = java.time.LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
    
    public int getPriorityWeight() { return priorityWeight; }
    public void setPriorityWeight(int priorityWeight) { this.priorityWeight = priorityWeight; }

    public String getElement() { return element != null ? element : "fogo"; }
    public void setElement(String element) { this.element = element; }

    public Integer getXpReward() { return xpReward != null ? xpReward : 50; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
