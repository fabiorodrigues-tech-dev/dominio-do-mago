-- Seed Master Mage user for automatic initialization and local development
INSERT INTO users (id, username, email, password_hash, arcane_level, total_trophy_points)
VALUES (gen_random_uuid(), 'Fábio Rodrigues', 'fabioandre777@gmail.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGzP1kKzG.y/Y6.Z1H.a', 1, 0)
ON CONFLICT (email) DO NOTHING;
