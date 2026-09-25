package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@Table(name = "habit_rotations")
public class HabitRotationEntity {

    @Id
    @Column(length = 100)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "recurrence_type", nullable = false, length = 20)
    private String recurrenceType; // DAILY, WEEKLY, MONTHLY, YEARLY

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recurrence_config", nullable = false, columnDefinition = "jsonb")
    private String recurrenceConfig;

    @Column(name = "current_position", nullable = false)
    private Integer currentPosition = 0;

    @Column(name = "last_completed_date", length = 10)
    private String lastCompletedDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order")
    private Integer displayOrder = 999999;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public HabitRotationEntity() {
    }

    public HabitRotationEntity(String id, String name, String recurrenceType, String recurrenceConfig) {
        this.id = id;
        this.name = name;
        this.recurrenceType = recurrenceType;
        this.recurrenceConfig = recurrenceConfig;
        this.currentPosition = 0;
        this.isActive = true;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(String recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public String getRecurrenceConfig() {
        return recurrenceConfig;
    }

    public void setRecurrenceConfig(String recurrenceConfig) {
        this.recurrenceConfig = recurrenceConfig;
    }

    public Integer getCurrentPosition() {
        return currentPosition;
    }

    public void setCurrentPosition(Integer currentPosition) {
        this.currentPosition = currentPosition;
    }

    public String getLastCompletedDate() {
        return lastCompletedDate;
    }

    public void setLastCompletedDate(String lastCompletedDate) {
        this.lastCompletedDate = lastCompletedDate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
