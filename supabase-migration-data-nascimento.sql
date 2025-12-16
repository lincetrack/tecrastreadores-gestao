-- =====================================================
-- MIGRATION: Adicionar campo data_nascimento na tabela clientes
-- Data: 2025-12-04
-- Objetivo: Permitir cadastro de data de nascimento para gestão de aniversários
-- =====================================================

-- Adicionar coluna data_nascimento (não obrigatória)
ALTER TABLE clientes
ADD COLUMN data_nascimento DATE;

-- Comentário explicativo
COMMENT ON COLUMN clientes.data_nascimento IS 'Data de nascimento do cliente (opcional - usado para pessoas físicas)';

-- Criar índice para otimizar consultas de aniversariantes
CREATE INDEX idx_clientes_data_nascimento ON clientes(data_nascimento);

-- Criar view para aniversariantes do mês
CREATE OR REPLACE VIEW v_aniversariantes_mes AS
SELECT
    id,
    nome,
    cnpj,
    telefone,
    email,
    data_nascimento,
    EXTRACT(DAY FROM data_nascimento) as dia_nascimento,
    EXTRACT(MONTH FROM data_nascimento) as mes_nascimento,
    EXTRACT(YEAR FROM data_nascimento) as ano_nascimento,
    DATE_PART('year', AGE(data_nascimento)) as idade,
    ativo
FROM clientes
WHERE data_nascimento IS NOT NULL
ORDER BY EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento);

-- Verificar resultado
SELECT
    'Migration executada com sucesso!' as mensagem,
    COUNT(*) as total_clientes_com_aniversario
FROM clientes
WHERE data_nascimento IS NOT NULL;
