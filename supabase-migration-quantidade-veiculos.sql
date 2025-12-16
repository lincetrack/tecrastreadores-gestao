-- =====================================================
-- MIGRATION: Adicionar campo quantidade_veiculos na tabela faturas
-- Data: 2025-12-04
-- Objetivo: Preservar quantidade de veículos no histórico de faturas
-- =====================================================

-- Adicionar coluna quantidade_veiculos
ALTER TABLE faturas
ADD COLUMN quantidade_veiculos INTEGER NOT NULL DEFAULT 1;

-- Comentário explicativo
COMMENT ON COLUMN faturas.quantidade_veiculos IS 'Quantidade de veículos do cliente no momento da geração da fatura';

-- Atualizar faturas existentes com a quantidade atual de veículos do cliente
-- (Para faturas já geradas, vamos usar a quantidade atual como aproximação)
UPDATE faturas f
SET quantidade_veiculos = COALESCE(
    (SELECT COUNT(*) FROM veiculos v WHERE v.cliente_id = f.cliente_id),
    1
);

-- Verificar resultado
SELECT
    'Migration executada com sucesso!' as mensagem,
    COUNT(*) as total_faturas_atualizadas
FROM faturas
WHERE quantidade_veiculos IS NOT NULL;
