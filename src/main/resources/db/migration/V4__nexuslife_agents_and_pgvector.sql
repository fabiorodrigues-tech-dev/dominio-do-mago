-- Habilita a extensão pgvector para armazenar e consultar embeddings vetoriais
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de estado dos agentes (Nível, XP, e o Prompt Dinâmico do sistema)
CREATE TABLE IF NOT EXISTS agents_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL UNIQUE, -- ex: 'ORCHESTRATOR', 'AURA', 'COUNSELOR', 'NUTRITION', 'CAREER'
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5),
    current_xp INT NOT NULL DEFAULT 0,
    system_prompt_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela da base de conhecimento dos agentes (RAG Gamificado)
CREATE TABLE IF NOT EXISTS agent_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents_state(id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL,
    content_chunk TEXT NOT NULL,
    -- Embedding de 1536 dimensões (Padrão para modelos como text-embedding-ada-002 ou text-embedding-3-small)
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index para otimizar busca de similaridade (HNSW - Hierarchical Navigable Small World)
CREATE INDEX IF NOT EXISTS agent_knowledge_base_embedding_idx 
ON agent_knowledge_base USING hnsw (embedding vector_l2_ops);

-- Trigger ou função para auto atualizar o 'updated_at' da agents_state (Opcional, mas boa prática)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agents_state_modtime ON agents_state;

CREATE TRIGGER update_agents_state_modtime
BEFORE UPDATE ON agents_state
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
