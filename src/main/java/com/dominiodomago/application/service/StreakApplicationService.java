package com.dominiodomago.application.service;

import com.dominiodomago.application.port.in.RegisterActivityUseCase;
import com.dominiodomago.application.port.out.UserRepositoryPort;
import com.dominiodomago.application.port.out.UserStreakData;
import com.dominiodomago.domain.model.StreakResult;
import com.dominiodomago.domain.service.StreakDomainService;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StreakApplicationService implements RegisterActivityUseCase {

    private final StreakDomainService streakDomainService;
    private final UserRepositoryPort userRepositoryPort;

    public StreakApplicationService(StreakDomainService streakDomainService,
                                     UserRepositoryPort userRepositoryPort) {
        this.streakDomainService = streakDomainService;
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    @Transactional
    public StreakResult registerActivity(UUID userId) {
        UserStreakData current = userRepositoryPort.findStreakDataById(userId)
            .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + userId));

        StreakResult result = streakDomainService.calculateStreak(
            current.currentStreak(),
            current.lastActivityDate(),
            current.elementalShields()
        );

        userRepositoryPort.updateStreakState(
            userId,
            result.currentStreak(),
            result.xpMultiplier(),
            result.remainingShields()
        );

        return result;
    }
}
