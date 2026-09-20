package com.dominiodomago.infrastructure.persistence.adapter;

import com.dominiodomago.application.port.out.UserRepositoryPort;
import com.dominiodomago.application.port.out.UserStreakData;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository userJpaRepository;

    public UserRepositoryAdapter(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public Optional<UserStreakData> findStreakDataById(UUID userId) {
        return userJpaRepository.findById(userId).map(entity -> new UserStreakData(
            entity.getId(),
            entity.getCurrentStreak(),
            entity.getLastActivityDate() != null ? entity.getLastActivityDate().toLocalDate() : null,
            entity.getElementalShields()
        ));
    }

    @Override
    public void updateStreakState(UUID userId, int newStreak, BigDecimal xpMultiplier, int remainingShields) {
        UserEntity entity = userJpaRepository.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + userId));

        entity.setCurrentStreak(newStreak);
        entity.setXpMultiplier(xpMultiplier);
        entity.setElementalShields(remainingShields);
        entity.setLastActivityDate(OffsetDateTime.now(ZoneOffset.UTC));

        userJpaRepository.save(entity);
    }
}
