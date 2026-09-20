package com.dominiodomago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "arcane_level")
    private int arcaneLevel = 1;

    @Column(name = "total_trophy_points")
    private int totalTrophyPoints = 0;

    @Column(name = "current_streak")
    private int currentStreak = 0;

    @Column(name = "last_activity_date")
    private OffsetDateTime lastActivityDate;

    @Column(name = "xp_multiplier", precision = 3, scale = 2)
    private BigDecimal xpMultiplier = BigDecimal.valueOf(1.00);

    @Column(name = "elemental_shields")
    private int elementalShields = 1;

    @Column(length = 50)
    private String timezone = "America/Sao_Paulo";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private int hp = 100;

    @Column(name = "fire_xp", nullable = false)
    private int fireXp = 0;

    @Column(name = "water_xp", nullable = false)
    private int waterXp = 0;

    @Column(name = "earth_xp", nullable = false)
    private int earthXp = 0;

    @Column(name = "air_xp", nullable = false)
    private int airXp = 0;

    @Column(nullable = false)
    private int energy = 100;

    protected UserEntity() {
        // JPA
    }

    public UserEntity(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public int getArcaneLevel() { return arcaneLevel; }
    public void setArcaneLevel(int arcaneLevel) { this.arcaneLevel = arcaneLevel; }
    public int getTotalTrophyPoints() { return totalTrophyPoints; }
    public void setTotalTrophyPoints(int totalTrophyPoints) { this.totalTrophyPoints = totalTrophyPoints; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public OffsetDateTime getLastActivityDate() { return lastActivityDate; }
    public void setLastActivityDate(OffsetDateTime lastActivityDate) { this.lastActivityDate = lastActivityDate; }
    public BigDecimal getXpMultiplier() { return xpMultiplier; }
    public void setXpMultiplier(BigDecimal xpMultiplier) { this.xpMultiplier = xpMultiplier; }
    public int getElementalShields() { return elementalShields; }
    public void setElementalShields(int elementalShields) { this.elementalShields = elementalShields; }
    public String getTimezone() { return timezone; }

    public int getHp() { return hp; }
    public void setHp(int hp) { this.hp = hp; }

    public int getFireXp() { return fireXp; }
    public void setFireXp(int fireXp) { this.fireXp = fireXp; }

    public int getWaterXp() { return waterXp; }
    public void setWaterXp(int waterXp) { this.waterXp = waterXp; }

    public int getEarthXp() { return earthXp; }
    public void setEarthXp(int earthXp) { this.earthXp = earthXp; }

    public int getAirXp() { return airXp; }
    public void setAirXp(int airXp) { this.airXp = airXp; }

    public int getEnergy() { return energy; }
    public void setEnergy(int energy) { this.energy = energy; }
}
