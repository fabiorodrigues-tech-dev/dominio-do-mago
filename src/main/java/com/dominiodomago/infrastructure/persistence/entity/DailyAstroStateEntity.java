package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "daily_astro_state")
public class DailyAstroStateEntity {

    @Id
    @Column(length = 10)
    private String date; // YYYY-MM-DD

    @Column(name = "moon_phase", nullable = false, length = 20)
    private String moonPhase; // NEW, WAXING, FULL, WANING

    @Column(name = "moon_sign", nullable = false, length = 20)
    private String moonSign; // earth, fire, water, air

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dominant_transits", columnDefinition = "jsonb")
    private String dominantTransits = "[]";

    @Column(name = "prana_regen_modifier", nullable = false, precision = 4, scale = 2)
    private BigDecimal pranaRegenModifier = BigDecimal.valueOf(1.00);

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "element_modifiers", nullable = false, columnDefinition = "jsonb")
    private String elementModifiers;

    @Column(name = "generated_at")
    private OffsetDateTime generatedAt = OffsetDateTime.now();

    public DailyAstroStateEntity() {
    }

    public DailyAstroStateEntity(String date, String moonPhase, String moonSign, String dominantTransits,
                                 BigDecimal pranaRegenModifier, String elementModifiers) {
        this.date = date;
        this.moonPhase = moonPhase;
        this.moonSign = moonSign;
        this.dominantTransits = dominantTransits != null ? dominantTransits : "[]";
        this.pranaRegenModifier = pranaRegenModifier != null ? pranaRegenModifier : BigDecimal.valueOf(1.00);
        this.elementModifiers = elementModifiers;
        this.generatedAt = OffsetDateTime.now();
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getMoonPhase() {
        return moonPhase;
    }

    public void setMoonPhase(String moonPhase) {
        this.moonPhase = moonPhase;
    }

    public String getMoonSign() {
        return moonSign;
    }

    public void setMoonSign(String moonSign) {
        this.moonSign = moonSign;
    }

    public String getDominantTransits() {
        return dominantTransits;
    }

    public void setDominantTransits(String dominantTransits) {
        this.dominantTransits = dominantTransits;
    }

    public BigDecimal getPranaRegenModifier() {
        return pranaRegenModifier;
    }

    public void setPranaRegenModifier(BigDecimal pranaRegenModifier) {
        this.pranaRegenModifier = pranaRegenModifier;
    }

    public String getElementModifiers() {
        return elementModifiers;
    }

    public void setElementModifiers(String elementModifiers) {
        this.elementModifiers = elementModifiers;
    }

    public OffsetDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(OffsetDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
