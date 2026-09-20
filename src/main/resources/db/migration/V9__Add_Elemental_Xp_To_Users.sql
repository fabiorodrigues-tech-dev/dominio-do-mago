-- Migration V9: Adiciona colunas para rastreamento de XP dos 4 Elementos na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS fire_xp INT DEFAULT 78;
ALTER TABLE users ADD COLUMN IF NOT EXISTS water_xp INT DEFAULT 45;
ALTER TABLE users ADD COLUMN IF NOT EXISTS earth_xp INT DEFAULT 92;
ALTER TABLE users ADD COLUMN IF NOT EXISTS air_xp INT DEFAULT 60;

-- Garante que registros existentes recebam os valores elementais base
UPDATE users SET fire_xp = 78 WHERE fire_xp IS NULL;
UPDATE users SET water_xp = 45 WHERE water_xp IS NULL;
UPDATE users SET earth_xp = 92 WHERE earth_xp IS NULL;
UPDATE users SET air_xp = 60 WHERE air_xp IS NULL;
