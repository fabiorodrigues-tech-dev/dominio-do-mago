-- ==============================================================================
-- FASE 6: Áreas Elementais Canônicas para Ações e Rituais do Mago
-- ==============================================================================

INSERT INTO areas (id, name, body_id, color_hex, is_primary)
VALUES 
    ('area-fogo', 'Corpo Físico & Vitalidade (Fogo)', 'body-fire', '#EF4444', true),
    ('area-agua', 'Emoções & Regeneração (Água)', 'body-water', '#3B82F6', true),
    ('area-terra', 'Material & Estrutura (Terra)', 'body-earth', '#10B981', true),
    ('area-ar', 'Mente & Sabedoria (Ar)', 'body-air', '#8B5CF6', true)
ON CONFLICT (id) DO NOTHING;
