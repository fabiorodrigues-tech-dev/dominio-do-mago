CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    arcane_level INT DEFAULT 1, -- Nível PSN/Mago
    total_trophy_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    xp_multiplier DECIMAL(3,2) DEFAULT 1.00,
    elemental_shields INT DEFAULT 1, -- Perdão TDAH
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    element_type VARCHAR(20) CHECK (element_type IN ('terra', 'agua', 'fogo', 'ar')),
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    color_theme VARCHAR(7) DEFAULT '#3B82F6'
);

CREATE INDEX idx_skills_user_id ON skills(user_id);
