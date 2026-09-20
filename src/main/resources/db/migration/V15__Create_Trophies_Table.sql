-- Módulo de Troféus e Conquistas (Fase 10)
-- Limpeza de estruturas anteriores não utilizadas
DROP TABLE IF EXISTS user_trophies CASCADE;
DROP TABLE IF EXISTS trophies CASCADE;

-- Nova tabela de troféus associados diretamente ao Mago
CREATE TABLE trophies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    tier VARCHAR(20) NOT NULL,
    icon_type VARCHAR(50),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_trophy_title UNIQUE (user_id, title)
);

CREATE INDEX idx_trophies_user_id ON trophies(user_id);
CREATE INDEX idx_trophies_unlocked_at ON trophies(unlocked_at DESC);
