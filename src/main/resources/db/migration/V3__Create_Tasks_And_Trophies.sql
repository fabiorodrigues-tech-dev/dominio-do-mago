-- Módulo de Tarefas: base para o Sorteio Gacha (Pity System)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('terra', 'agua', 'fogo', 'ar')),
    base_weight INT NOT NULL DEFAULT 1 CHECK (base_weight > 0),
    last_completed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_user_active ON tasks(user_id, is_active);

-- Módulo de Troféus: espelha a filosofia de Troféus PSN (Bronze/Prata/Ouro/Platina)
CREATE TABLE IF NOT EXISTS trophies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('BRONZE', 'PRATA', 'OURO', 'PLATINA')),
    points INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_trophies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trophy_id UUID NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_trophy UNIQUE (user_id, trophy_id)
);
CREATE INDEX idx_user_trophies_user ON user_trophies(user_id);
