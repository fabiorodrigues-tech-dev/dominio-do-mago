package com.dominiodomago.application.port.in;

import java.util.UUID;

public interface SocialUseCase {

    /** Envia um pedido de Pacto (amizade) de requesterId para targetId. */
    UUID sendPactRequest(UUID requesterId, UUID targetId);

    /** Aceita um Pacto pendente. */
    void acceptPact(UUID pactId, UUID accepterId);

    /** Compartilha Mana (like) no perfil de outro usuário. */
    void likeProfile(UUID likerId, UUID profileOwnerId);
}
