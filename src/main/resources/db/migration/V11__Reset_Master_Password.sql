-- Migration V11: Redefinição de senha mestre para "Magoarquiteto" e garantia de seed do usuário Mestre
INSERT INTO users (id, username, email, password_hash, arcane_level, total_trophy_points, hp, fire_xp, water_xp, earth_xp, air_xp)
VALUES (
    gen_random_uuid(),
    'Fábio Rodrigues',
    'fabioandre777@gmail.com',
    '$2a$10$UcYMGqBWPPSiuQKqf2naVOFHomx5pDWl9AaUip5vq.iMy0.GnQBfa',
    1,
    0,
    100,
    78,
    45,
    92,
    60
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
