package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "areas")
public class AreaEntity {

    @Id
    @Column(length = 100)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "body_id", length = 50)
    private String bodyId;

    @Column(name = "color_hex", length = 20)
    private String colorHex;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public AreaEntity() {
    }

    public AreaEntity(String id, String name, String bodyId, String colorHex, Boolean isPrimary) {
        this.id = id;
        this.name = name;
        this.bodyId = bodyId;
        this.colorHex = colorHex;
        this.isPrimary = isPrimary;
        this.createdAt = OffsetDateTime.now();
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

    public String getBodyId() {
        return bodyId;
    }

    public void setBodyId(String bodyId) {
        this.bodyId = bodyId;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
