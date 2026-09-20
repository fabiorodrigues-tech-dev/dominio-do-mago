-- Migration V10: Adiciona HP à tabela users e cria tabelas rituais e missões

ALTER TABLE users ADD COLUMN IF NOT EXISTS hp INT DEFAULT 100;
UPDATE users SET hp = 100 WHERE hp IS NULL;

CREATE TABLE IF NOT EXISTS rituals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    element VARCHAR(50),
    xp_reward INT DEFAULT 0,
    hp_penalty INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_ritual_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    element VARCHAR(50),
    xp_reward INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    CONSTRAINT fk_mission_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
