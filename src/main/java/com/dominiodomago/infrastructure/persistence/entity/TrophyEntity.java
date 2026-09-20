package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trophies")
public class TrophyEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String tier;

    @Column(name = "icon_type", length = 50)
    private String iconType;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt = LocalDateTime.now();

    protected TrophyEntity() {
        // JPA
    }

    public TrophyEntity(UserEntity user, String title, String description, String tier, String iconType, LocalDateTime unlockedAt) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.tier = tier;
        this.iconType = iconType;
        this.unlockedAt = unlockedAt != null ? unlockedAt : LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getIconType() {
        return iconType;
    }

    public void setIconType(String iconType) {
        this.iconType = iconType;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
}
