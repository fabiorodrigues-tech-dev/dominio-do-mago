package com.dominiodomago.infrastructure.persistence.adapter;

import com.dominiodomago.application.port.out.ManaLikeRepositoryPort;
import com.dominiodomago.infrastructure.persistence.entity.ManaLikeEntity;
import com.dominiodomago.infrastructure.persistence.repository.ManaLikeJpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ManaLikeRepositoryAdapter implements ManaLikeRepositoryPort {

    private final ManaLikeJpaRepository manaLikeJpaRepository;

    public ManaLikeRepositoryAdapter(ManaLikeJpaRepository manaLikeJpaRepository) {
        this.manaLikeJpaRepository = manaLikeJpaRepository;
    }

    @Override
    public boolean alreadyLiked(UUID likerId, UUID profileOwnerId) {
        return manaLikeJpaRepository.existsByLikerIdAndProfileOwnerId(likerId, profileOwnerId);
    }

    @Override
    public void save(UUID likerId, UUID profileOwnerId) {
        manaLikeJpaRepository.save(new ManaLikeEntity(likerId, profileOwnerId));
    }
}
