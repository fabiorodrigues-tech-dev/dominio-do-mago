package com.dominiodomago.application.service;

import com.dominiodomago.application.port.in.SocialUseCase;
import com.dominiodomago.application.port.out.ManaLikeRepositoryPort;
import com.dominiodomago.application.port.out.PactRepositoryPort;
import com.dominiodomago.domain.model.PactStatus;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SocialApplicationService implements SocialUseCase {

    private final PactRepositoryPort pactRepositoryPort;
    private final ManaLikeRepositoryPort manaLikeRepositoryPort;

    public SocialApplicationService(PactRepositoryPort pactRepositoryPort,
                                     ManaLikeRepositoryPort manaLikeRepositoryPort) {
        this.pactRepositoryPort = pactRepositoryPort;
        this.manaLikeRepositoryPort = manaLikeRepositoryPort;
    }

    @Override
    @Transactional
    public UUID sendPactRequest(UUID requesterId, UUID targetId) {
        if (requesterId.equals(targetId)) {
            throw new IllegalArgumentException("Não é possível criar um Pacto consigo mesmo.");
        }
        if (pactRepositoryPort.existsBetween(requesterId, targetId)) {
            throw new IllegalStateException("Já existe um Pacto entre estes dois usuários.");
        }

        // A constraint 'ordered_pact_pair' do banco exige user_id_1 < user_id_2.
        UUID first = requesterId.compareTo(targetId) < 0 ? requesterId : targetId;
        UUID second = requesterId.compareTo(targetId) < 0 ? targetId : requesterId;

        return pactRepositoryPort.createPact(first, second, PactStatus.PENDING);
    }

    @Override
    @Transactional
    public void acceptPact(UUID pactId, UUID accepterId) {
        PactStatus status = pactRepositoryPort.findStatus(pactId)
            .orElseThrow(() -> new NoSuchElementException("Pacto não encontrado: " + pactId));

        if (status != PactStatus.PENDING) {
            throw new IllegalStateException("Apenas Pactos pendentes podem ser aceitos.");
        }
        pactRepositoryPort.updateStatus(pactId, PactStatus.ACCEPTED);
    }

    @Override
    @Transactional
    public void likeProfile(UUID likerId, UUID profileOwnerId) {
        if (likerId.equals(profileOwnerId)) {
            throw new IllegalArgumentException("Não é possível compartilhar Mana com o próprio perfil.");
        }
        if (manaLikeRepositoryPort.alreadyLiked(likerId, profileOwnerId)) {
            return; // idempotente: like duplicado é ignorado silenciosamente
        }
        manaLikeRepositoryPort.save(likerId, profileOwnerId);
    }
}
