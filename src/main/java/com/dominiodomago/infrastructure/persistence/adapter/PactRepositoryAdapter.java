package com.dominiodomago.infrastructure.persistence.adapter;

import com.dominiodomago.application.port.out.PactRepositoryPort;
import com.dominiodomago.domain.model.PactStatus;
import com.dominiodomago.infrastructure.persistence.entity.PactEntity;
import com.dominiodomago.infrastructure.persistence.repository.PactJpaRepository;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class PactRepositoryAdapter implements PactRepositoryPort {

    private final PactJpaRepository pactJpaRepository;

    public PactRepositoryAdapter(PactJpaRepository pactJpaRepository) {
        this.pactJpaRepository = pactJpaRepository;
    }

    @Override
    public boolean existsBetween(UUID userIdA, UUID userIdB) {
        UUID first = userIdA.compareTo(userIdB) < 0 ? userIdA : userIdB;
        UUID second = userIdA.compareTo(userIdB) < 0 ? userIdB : userIdA;
        return pactJpaRepository.existsByUserId1AndUserId2(first, second);
    }

    @Override
    public UUID createPact(UUID userId1, UUID userId2, PactStatus status) {
        // Pressupõe userId1 < userId2, conforme a constraint 'ordered_pact_pair' do banco.
        PactEntity saved = pactJpaRepository.save(new PactEntity(userId1, userId2, status.name()));
        return saved.getId();
    }

    @Override
    public Optional<PactStatus> findStatus(UUID pactId) {
        return pactJpaRepository.findById(pactId).map(entity -> PactStatus.valueOf(entity.getStatus()));
    }

    @Override
    public void updateStatus(UUID pactId, PactStatus status) {
        PactEntity entity = pactJpaRepository.findById(pactId)
            .orElseThrow(() -> new NoSuchElementException("Pacto não encontrado: " + pactId));
        entity.setStatus(status.name());
        pactJpaRepository.save(entity);
    }
}
