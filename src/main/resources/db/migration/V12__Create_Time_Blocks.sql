-- Migration V12: Criação da tabela time_blocks para gestão de blocos de tempo e agenda do Mago
CREATE TABLE IF NOT EXISTS time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_time_block_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_time_blocks_user_start_time ON time_blocks (user_id, start_time);
