package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "rotation_memberships", uniqueConstraints = {
    @UniqueConstraint(name = "uq_rotation_habit", columnNames = {"rotation_id", "habit_id"}),
    @UniqueConstraint(name = "uq_rotation_position", columnNames = {"rotation_id", "position"})
})
public class RotationMembershipEntity {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "rotation_id", nullable = false, length = 100)
    private String rotationId;

    @Column(name = "habit_id", nullable = false, length = 100)
    private String habitId;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "added_at")
    private OffsetDateTime addedAt = OffsetDateTime.now();

    public RotationMembershipEntity() {
    }

    public RotationMembershipEntity(String id, String rotationId, String habitId, Integer position) {
        this.id = id;
        this.rotationId = rotationId;
        this.habitId = habitId;
        this.position = position;
        this.addedAt = OffsetDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRotationId() {
        return rotationId;
    }

    public void setRotationId(String rotationId) {
        this.rotationId = rotationId;
    }

    public String getHabitId() {
        return habitId;
    }

    public void setHabitId(String habitId) {
        this.habitId = habitId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public OffsetDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(OffsetDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
