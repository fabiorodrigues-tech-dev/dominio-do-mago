package com.dominiodomago.infrastructure.persistence.entity;

import com.dominiodomago.domain.model.Element;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "missions")
public class MissionEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Element element;

    @Column(name = "xp_reward")
    private int xpReward = 0;

    @Column(name = "is_completed")
    private boolean isCompleted = false;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    protected MissionEntity() {
        // JPA
    }

    public MissionEntity(UserEntity user, String title, Element element, int xpReward) {
        this.user = user;
        this.title = title;
        this.element = element;
        this.xpReward = xpReward;
    }

    public UUID getId() { return id; }
    
    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Element getElement() { return element; }
    public void setElement(Element element) { this.element = element; }

    public int getXpReward() { return xpReward; }
    public void setXpReward(int xpReward) { this.xpReward = xpReward; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }
}
