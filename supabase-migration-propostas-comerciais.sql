-- Migration: Propostas Comerciais
-- Descrição: Cria tabela para gerenciar propostas comerciais enviadas a prospects

-- Criar tabela de propostas comerciais
CREATE TABLE IF NOT EXISTS propostas_comerciais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_proposta INTEGER NOT NULL UNIQUE,

    -- Dados do Prospect
    tipo_pessoa VARCHAR(10) NOT NULL DEFAULT 'juridica' CHECK (tipo_pessoa IN ('fisica', 'juridica')),
    prospect_nome VARCHAR(255) NOT NULL,
    prospect_contato VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255) NOT NULL,
    prospect_telefone VARCHAR(20) NOT NULL,
    prospect_documento VARCHAR(18) NOT NULL,
    prospect_cidade VARCHAR(100) NOT NULL,
    prospect_estado VARCHAR(2) NOT NULL,

    -- Dados da Proposta
    tipo_equipamento VARCHAR(100) NOT NULL,
    plano VARCHAR(100) NOT NULL,
    valor_mensal DECIMAL(10, 2) NOT NULL,
    quantidade_veiculos INTEGER NOT NULL DEFAULT 1,
    instalacao_gratuita BOOLEAN NOT NULL DEFAULT true,
    valor_instalacao DECIMAL(10, 2),
    prazo_permanencia INTEGER NOT NULL DEFAULT 12,

    -- Informações adicionais
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'aprovada', 'recusada')),
    data_validade DATE NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar sequence para numero_proposta
CREATE SEQUENCE IF NOT EXISTS propostas_numero_seq START WITH 1;
ALTER TABLE propostas_comerciais ALTER COLUMN numero_proposta SET DEFAULT nextval('propostas_numero_seq');

-- Criar índices para melhorar performance
CREATE INDEX idx_propostas_prospect_nome ON propostas_comerciais(prospect_nome);
CREATE INDEX idx_propostas_prospect_email ON propostas_comerciais(prospect_email);
CREATE INDEX idx_propostas_status ON propostas_comerciais(status);
CREATE INDEX idx_propostas_data_validade ON propostas_comerciais(data_validade);
CREATE INDEX idx_propostas_created_at ON propostas_comerciais(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_propostas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_propostas_updated_at
    BEFORE UPDATE ON propostas_comerciais
    FOR EACH ROW
    EXECUTE FUNCTION update_propostas_updated_at();

-- Comentários na tabela e colunas
COMMENT ON TABLE propostas_comerciais IS 'Armazena propostas comerciais enviadas a clientes prospectivos (PF ou PJ)';
COMMENT ON COLUMN propostas_comerciais.numero_proposta IS 'Número sequencial da proposta para referência';
COMMENT ON COLUMN propostas_comerciais.tipo_pessoa IS 'Tipo de pessoa: fisica (CPF) ou juridica (CNPJ)';
COMMENT ON COLUMN propostas_comerciais.prospect_documento IS 'CPF (11 dígitos) ou CNPJ (14 dígitos) do prospect';
COMMENT ON COLUMN propostas_comerciais.status IS 'Status da proposta: pendente, enviada, aprovada ou recusada';
COMMENT ON COLUMN propostas_comerciais.data_validade IS 'Data de validade da proposta comercial';
COMMENT ON COLUMN propostas_comerciais.prazo_permanencia IS 'Prazo de permanência em meses';
