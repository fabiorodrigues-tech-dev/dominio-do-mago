package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mana_likes")
public class ManaLikeEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "liker_id", nullable = false)
    private UUID likerId;

    @Column(name = "profile_owner_id", nullable = false)
    private UUID profileOwnerId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    protected ManaLikeEntity() {
        // JPA
    }

    public ManaLikeEntity(UUID likerId, UUID profileOwnerId) {
        this.likerId = likerId;
        this.profileOwnerId = profileOwnerId;
    }

    public UUID getId() { return id; }
    public UUID getLikerId() { return likerId; }
    public UUID getProfileOwnerId() { return profileOwnerId; }
}
