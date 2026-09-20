-- Módulo Social: Pactos (Amizades) e Compartilhamento de Mana (Likes)
CREATE TABLE IF NOT EXISTS pacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'BLOCKED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_pact_pair UNIQUE (user_id_1, user_id_2),
    CONSTRAINT no_self_pact CHECK (user_id_1 <> user_id_2),
    -- Normaliza a ordem do par para impedir duplicidade nos dois sentidos (A->B e B->A)
    CONSTRAINT ordered_pact_pair CHECK (user_id_1 < user_id_2)
);
CREATE INDEX idx_pacts_user_1 ON pacts(user_id_1);
CREATE INDEX idx_pacts_user_2 ON pacts(user_id_2);

CREATE TABLE IF NOT EXISTS mana_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_mana_like UNIQUE (liker_id, profile_owner_id),
    CONSTRAINT no_self_like CHECK (liker_id <> profile_owner_id)
);
CREATE INDEX idx_mana_likes_owner ON mana_likes(profile_owner_id);
