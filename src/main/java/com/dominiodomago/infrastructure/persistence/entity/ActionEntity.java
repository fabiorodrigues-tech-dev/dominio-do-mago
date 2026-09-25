package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "actions")
public class ActionEntity {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "area_id", length = 100)
    private String areaId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_value", precision = 10, scale = 2)
    private BigDecimal baseValue = BigDecimal.valueOf(1.00);

    @Column(name = "task_energy_type", length = 20)
    private String taskEnergyType = "NEUTRAL"; // NEUTRAL, RESTORATIVE, POISON

    @Column(name = "recurrence_enabled")
    private Boolean recurrenceEnabled = false;

    @Column(name = "recurrence_type", length = 20)
    private String recurrenceType; // DAILY, WEEKLY, MONTHLY, YEARLY

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recurrence_config", columnDefinition = "jsonb")
    private String recurrenceConfig;

    @Column(name = "source_module", length = 50)
    private String sourceModule;

    @Column(name = "source_ref_id", length = 100)
    private String sourceRefId;

    @Column(name = "controlled_by_rotation_id", length = 100)
    private String controlledByRotationId;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "last_completed_at")
    private OffsetDateTime lastCompletedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ActionEntity() {
    }

    public ActionEntity(String id, String title, BigDecimal baseValue) {
        this.id = id;
        this.title = title;
        this.baseValue = baseValue;
        this.createdAt = OffsetDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getAreaId() {
        return areaId;
    }

    public void setAreaId(String areaId) {
        this.areaId = areaId;
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

    public BigDecimal getBaseValue() {
        return baseValue;
    }

    public void setBaseValue(BigDecimal baseValue) {
        this.baseValue = baseValue;
    }

    public String getTaskEnergyType() {
        return taskEnergyType;
    }

    public void setTaskEnergyType(String taskEnergyType) {
        this.taskEnergyType = taskEnergyType;
    }

    public Boolean getRecurrenceEnabled() {
        return recurrenceEnabled;
    }

    public void setRecurrenceEnabled(Boolean recurrenceEnabled) {
        this.recurrenceEnabled = recurrenceEnabled;
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

    public String getSourceModule() {
        return sourceModule;
    }

    public void setSourceModule(String sourceModule) {
        this.sourceModule = sourceModule;
    }

    public String getSourceRefId() {
        return sourceRefId;
    }

    public void setSourceRefId(String sourceRefId) {
        this.sourceRefId = sourceRefId;
    }

    public String getControlledByRotationId() {
        return controlledByRotationId;
    }

    public void setControlledByRotationId(String controlledByRotationId) {
        this.controlledByRotationId = controlledByRotationId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public OffsetDateTime getLastCompletedAt() {
        return lastCompletedAt;
    }

    public void setLastCompletedAt(OffsetDateTime lastCompletedAt) {
        this.lastCompletedAt = lastCompletedAt;
    }
}
