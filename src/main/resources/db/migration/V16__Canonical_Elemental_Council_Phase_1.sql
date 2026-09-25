-- ==============================================================================
-- FASE 1: Migração Canônica do Domínio do Mago (Conselho Elemental v4.0)
-- ==============================================================================

-- 0. Pré-requisitos Estruturais: Tabelas Base (Areas e Actions)
CREATE TABLE IF NOT EXISTS areas (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    body_id VARCHAR(50),
    color_hex VARCHAR(20),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS actions (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    area_id VARCHAR(100) REFERENCES areas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    base_value NUMERIC(10, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Prana no Perfil do Mago / Usuário
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS prana_level INTEGER NOT NULL DEFAULT 100 CHECK (prana_level >= 0 AND prana_level <= 100),
ADD COLUMN IF NOT EXISTS last_prana_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. Atualização da tabela de Ações para suporte a Hábitos, Decimais, Prana e Módulos Nativos
ALTER TABLE actions
ALTER COLUMN base_value TYPE NUMERIC(10, 2);

ALTER TABLE actions
ADD COLUMN IF NOT EXISTS task_energy_type VARCHAR(20) DEFAULT 'NEUTRAL' CHECK (task_energy_type IN ('NEUTRAL', 'RESTORATIVE', 'POISON')),
ADD COLUMN IF NOT EXISTS recurrence_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
ADD COLUMN IF NOT EXISTS recurrence_config JSONB,
ADD COLUMN IF NOT EXISTS source_module VARCHAR(50),
ADD COLUMN IF NOT EXISTS source_ref_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS controlled_by_rotation_id VARCHAR(100);

-- 3. Máquina de Estados de Rotação de Hábitos (HabitRotation)
CREATE TABLE IF NOT EXISTS habit_rotations (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recurrence_type VARCHAR(20) NOT NULL CHECK (recurrence_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    recurrence_config JSONB NOT NULL,
    current_position INTEGER NOT NULL DEFAULT 0,
    last_completed_date VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 999999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rotation_memberships (
    id VARCHAR(100) PRIMARY KEY,
    rotation_id VARCHAR(100) NOT NULL REFERENCES habit_rotations(id) ON DELETE CASCADE,
    habit_id VARCHAR(100) NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_rotation_habit UNIQUE (rotation_id, habit_id),
    CONSTRAINT uq_rotation_position UNIQUE (rotation_id, position)
);

-- 4. Motor Astrológico (Cache Diário)
CREATE TABLE IF NOT EXISTS daily_astro_state (
    date VARCHAR(10) PRIMARY KEY, -- YYYY-MM-DD
    moon_phase VARCHAR(20) NOT NULL CHECK (moon_phase IN ('NEW', 'WAXING', 'FULL', 'WANING')),
    moon_sign VARCHAR(20) NOT NULL CHECK (moon_sign IN ('earth', 'fire', 'water', 'air')),
    dominant_transits JSONB DEFAULT '[]'::jsonb,
    prana_regen_modifier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    element_modifiers JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Registro da Área Fallback (SEM_CATEGORIA)
INSERT INTO areas (id, name, body_id, color_hex, is_primary)
VALUES ('area-sem-categoria', 'Sem Categoria', 'body-earth', '#9CA3AF', false)
ON CONFLICT (id) DO NOTHING;
