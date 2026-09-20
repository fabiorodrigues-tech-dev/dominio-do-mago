package com.dominiodomago.domain.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "arcane_level")
    private Integer arcaneLevel = 1;

    @Column(name = "total_trophy_points")
    private Integer totalTrophyPoints = 0;

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @Column(name = "xp_multiplier")
    private Double xpMultiplier = 1.0;

    @Column(name = "elemental_shields")
    private Integer elementalShields = 1;

    @Column(length = 50)
    private String timezone = "America/Sao_Paulo";

    @Column(name = "avatar_glb_url", length = 500)
    private String avatarGlbUrl;

    @Column(name = "fire_xp")
    private Integer fireXp = 78;

    @Column(name = "water_xp")
    private Integer waterXp = 45;

    @Column(name = "earth_xp")
    private Integer earthXp = 92;

    @Column(name = "air_xp")
    private Integer airXp = 60;

    @Column(name = "hp", nullable = false)
    private Integer hp = 100;

    @Column(name = "energy", nullable = false)
    private Integer energy = 100;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Integer getArcaneLevel() { return arcaneLevel; }
    public void setArcaneLevel(Integer arcaneLevel) { this.arcaneLevel = arcaneLevel; }

    public Integer getTotalTrophyPoints() { return totalTrophyPoints; }
    public void setTotalTrophyPoints(Integer totalTrophyPoints) { this.totalTrophyPoints = totalTrophyPoints; }

    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public LocalDateTime getLastActivityDate() { return lastActivityDate; }
    public void setLastActivityDate(LocalDateTime lastActivityDate) { this.lastActivityDate = lastActivityDate; }

    public Double getXpMultiplier() { return xpMultiplier; }
    public void setXpMultiplier(Double xpMultiplier) { this.xpMultiplier = xpMultiplier; }

    public Integer getElementalShields() { return elementalShields; }
    public void setElementalShields(Integer elementalShields) { this.elementalShields = elementalShields; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getAvatarGlbUrl() { return avatarGlbUrl; }
    public void setAvatarGlbUrl(String avatarGlbUrl) { this.avatarGlbUrl = avatarGlbUrl; }

    public Integer getFireXp() { return fireXp != null ? fireXp : 78; }
    public void setFireXp(Integer fireXp) { this.fireXp = fireXp; }

    public Integer getWaterXp() { return waterXp != null ? waterXp : 45; }
    public void setWaterXp(Integer waterXp) { this.waterXp = waterXp; }

    public Integer getEarthXp() { return earthXp != null ? earthXp : 92; }
    public void setEarthXp(Integer earthXp) { this.earthXp = earthXp; }

    public Integer getAirXp() { return airXp != null ? airXp : 60; }
    public void setAirXp(Integer airXp) { this.airXp = airXp; }

    public Integer getHp() { return hp != null ? hp : 100; }
    public void setHp(Integer hp) { this.hp = hp; }

    public Integer getEnergy() { return energy != null ? energy : 100; }
    public void setEnergy(Integer energy) { this.energy = energy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Spring Security UserDetails methods

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // Por enquanto, todos tem a mesma autoridade base
    }

    @Override
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    public String getUsername() {
        return this.username; // Note: O Spring Security usa isso como principal. Usaremos o email no login.
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
