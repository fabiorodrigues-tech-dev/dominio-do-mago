package com.dominiodomago.domain.service;

import com.dominiodomago.domain.model.Element;
import com.dominiodomago.infrastructure.persistence.entity.MissionEntity;
import com.dominiodomago.infrastructure.persistence.entity.RitualEntity;
import com.dominiodomago.infrastructure.persistence.entity.UserEntity;
import com.dominiodomago.infrastructure.persistence.repository.MissionRepository;
import com.dominiodomago.infrastructure.persistence.repository.RitualRepository;
import com.dominiodomago.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class LoreService {

    private final MissionRepository missionRepository;
    private final RitualRepository ritualRepository;
    private final UserJpaRepository userRepository;
    private final GamificationEngineService gamificationEngineService;

    public LoreService(MissionRepository missionRepository,
                       RitualRepository ritualRepository,
                       UserJpaRepository userRepository,
                       GamificationEngineService gamificationEngineService) {
        this.missionRepository = missionRepository;
        this.ritualRepository = ritualRepository;
        this.userRepository = userRepository;
        this.gamificationEngineService = gamificationEngineService;
    }

    @Transactional
    public void completeMission(UUID missionId) {
        MissionEntity mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new IllegalArgumentException("Missão não encontrada."));

        if (mission.isCompleted()) {
            throw new IllegalStateException("Missão já foi concluída.");
        }

        UserEntity user = mission.getUser();
        int reward = mission.getXpReward();
        Element element = mission.getElement();

        if (element != null) {
            switch (element) {
                case FOGO -> user.setFireXp(user.getFireXp() + reward);
                case AGUA -> user.setWaterXp(user.getWaterXp() + reward);
                case TERRA -> user.setEarthXp(user.getEarthXp() + reward);
                case AR -> user.setAirXp(user.getAirXp() + reward);
            }
        }

        mission.setCompleted(true);
        mission.setCompletedAt(OffsetDateTime.now());

        gamificationEngineService.calculateLevelUp(user);
        missionRepository.save(mission);
    }

    @Transactional
    public void completeRitual(UUID ritualId) {
        RitualEntity ritual = ritualRepository.findById(ritualId)
                .orElseThrow(() -> new IllegalArgumentException("Ritual não encontrado."));

        if (!ritual.isActive()) {
            throw new IllegalStateException("Ritual não está ativo.");
        }

        UserEntity user = ritual.getUser();
        int reward = ritual.getXpReward();
        Element element = ritual.getElement();

        if (element != null) {
            switch (element) {
                case FOGO -> user.setFireXp(user.getFireXp() + reward);
                case AGUA -> user.setWaterXp(user.getWaterXp() + reward);
                case TERRA -> user.setEarthXp(user.getEarthXp() + reward);
                case AR -> user.setAirXp(user.getAirXp() + reward);
            }
        }

        gamificationEngineService.calculateLevelUp(user);
        ritualRepository.save(ritual);
    }

    @Transactional
    public void failRitual(UUID ritualId) {
        RitualEntity ritual = ritualRepository.findById(ritualId)
                .orElseThrow(() -> new IllegalArgumentException("Ritual não encontrado."));

        if (!ritual.isActive()) {
            throw new IllegalStateException("Ritual não está ativo.");
        }

        UserEntity user = ritual.getUser();
        int penalty = ritual.getHpPenalty();

        user.setHp(Math.max(0, user.getHp() - penalty));

        userRepository.save(user);
    }
}
