-- Fix password hash for master mage fabioandre777@gmail.com to 123456
UPDATE users 
SET password_hash = '$2a$10$Ng7KLFsUVxypJGkON/6Raumy3TzKi6OVNbZmP9TylRkYuPAA/eeDK'
WHERE email = 'fabioandre777@gmail.com';

INSERT INTO users (id, username, email, password_hash, arcane_level, total_trophy_points)
VALUES (gen_random_uuid(), 'Fábio Rodrigues', 'fabioandre777@gmail.com', '$2a$10$Ng7KLFsUVxypJGkON/6Raumy3TzKi6OVNbZmP9TylRkYuPAA/eeDK', 1, 0)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
