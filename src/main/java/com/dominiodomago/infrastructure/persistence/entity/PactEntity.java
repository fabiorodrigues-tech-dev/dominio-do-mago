package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pacts")
public class PactEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id_1", nullable = false)
    private UUID userId1;

    @Column(name = "user_id_2", nullable = false)
    private UUID userId2;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected PactEntity() {
        // JPA
    }

    public PactEntity(UUID userId1, UUID userId2, String status) {
        this.userId1 = userId1;
        this.userId2 = userId2;
        this.status = status;
    }

    public UUID getId() { return id; }
    public UUID getUserId1() { return userId1; }
    public UUID getUserId2() { return userId2; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
