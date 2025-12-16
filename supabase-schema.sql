-- =====================================================
-- LINCE TRACK ERP - SCHEMA COMPLETO PARA SUPABASE
-- Sistema de Gestão para Rastreamento Veicular
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    endereco VARCHAR(500) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10),
    valor_mensalidade DECIMAL(10, 2) NOT NULL DEFAULT 79.90,
    dia_vencimento VARCHAR(2) NOT NULL DEFAULT '10',
    login_plataforma VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_clientes_nome ON clientes(nome);

-- =====================================================
-- TABELA: VEÍCULOS
-- =====================================================
CREATE TABLE IF NOT EXISTS veiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    veiculo VARCHAR(100) NOT NULL,
    placa VARCHAR(7) NOT NULL,
    tipo_rastreador VARCHAR(50) NOT NULL,
    imei VARCHAR(15) NOT NULL,
    com_bloqueio BOOLEAN NOT NULL DEFAULT FALSE,
    numero_chip VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_veiculos_imei ON veiculos(imei);

-- =====================================================
-- TABELA: FATURAS
-- =====================================================
CREATE TABLE IF NOT EXISTS faturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    cliente_nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_emissao DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    enviado_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_faturas_cliente_id ON faturas(cliente_id);
CREATE INDEX idx_faturas_data_vencimento ON faturas(data_vencimento);
CREATE INDEX idx_faturas_status ON faturas(status);
CREATE INDEX idx_faturas_data_emissao ON faturas(data_emissao);

-- =====================================================
-- TABELA: DESPESAS
-- =====================================================
CREATE TABLE IF NOT EXISTS despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
    fornecedor VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX idx_despesas_status ON despesas(status);
CREATE INDEX idx_despesas_categoria ON despesas(categoria);

-- =====================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON veiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faturas_updated_at BEFORE UPDATE ON faturas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON despesas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Permitir leitura de clientes para usuários autenticados"
    ON clientes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção de clientes para usuários autenticados"
    ON clientes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de clientes para usuários autenticados"
    ON clientes FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Permitir exclusão de clientes para usuários autenticados"
    ON clientes FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para veículos
CREATE POLICY "Permitir leitura de veículos para usuários autenticados"
    ON veiculos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção de veículos para usuários autenticados"
    ON veiculos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de veículos para usuários autenticados"
    ON veiculos FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Permitir exclusão de veículos para usuários autenticados"
    ON veiculos FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para faturas
CREATE POLICY "Permitir leitura de faturas para usuários autenticados"
    ON faturas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção de faturas para usuários autenticados"
    ON faturas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de faturas para usuários autenticados"
    ON faturas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Permitir exclusão de faturas para usuários autenticados"
    ON faturas FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para despesas
CREATE POLICY "Permitir leitura de despesas para usuários autenticados"
    ON despesas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção de despesas para usuários autenticados"
    ON despesas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de despesas para usuários autenticados"
    ON despesas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Permitir exclusão de despesas para usuários autenticados"
    ON despesas FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - PODE SER REMOVIDO)
-- =====================================================

-- Inserir clientes de exemplo
INSERT INTO clientes (nome, cnpj, telefone, email, endereco, bairro, cidade, estado, cep, valor_mensalidade, dia_vencimento, login_plataforma, ativo)
VALUES
    ('Ciranda Mágica Imp. e Dist.', '50.982.380/0001-85', '44999999999', 'contato@cirandamagica.com.br', 'Rua Lobelia 1122', 'Gleba Ribeirão', 'Maringá', 'PR', '87000-000', 79.90, '20', 'ciranda.magica', TRUE),
    ('Transportadora Veloz Ltda', '12.345.678/0001-99', '11988888888', 'financeiro@veloz.com.br', 'Av. Brasil 100', 'Centro', 'São Paulo', 'SP', '01000-000', 150.00, '10', 'veloz.transp', TRUE)
ON CONFLICT (cnpj) DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Clientes com total de veículos
CREATE OR REPLACE VIEW v_clientes_resumo AS
SELECT
    c.*,
    COUNT(v.id) as total_veiculos
FROM clientes c
LEFT JOIN veiculos v ON c.id = v.cliente_id
GROUP BY c.id;

-- View: Faturas com informações do cliente
CREATE OR REPLACE VIEW v_faturas_detalhadas AS
SELECT
    f.*,
    c.telefone as cliente_telefone,
    c.email as cliente_email,
    c.cnpj as cliente_cnpj
FROM faturas f
INNER JOIN clientes c ON f.cliente_id = c.id;

-- View: Resumo financeiro mensal
CREATE OR REPLACE VIEW v_resumo_financeiro_mensal AS
SELECT
    TO_CHAR(data_vencimento, 'YYYY-MM') as mes,
    SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as receitas_pagas,
    SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as receitas_pendentes,
    SUM(valor) as receitas_total,
    COUNT(*) as total_faturas
FROM faturas
GROUP BY TO_CHAR(data_vencimento, 'YYYY-MM')
ORDER BY mes DESC;

-- View: Despesas por categoria
CREATE OR REPLACE VIEW v_despesas_por_categoria AS
SELECT
    categoria,
    COUNT(*) as quantidade,
    SUM(valor) as total,
    SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as total_pago,
    SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as total_pendente
FROM despesas
GROUP BY categoria
ORDER BY total DESC;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE clientes IS 'Tabela de clientes do sistema de rastreamento veicular';
COMMENT ON TABLE veiculos IS 'Tabela de veículos rastreados vinculados aos clientes';
COMMENT ON TABLE faturas IS 'Tabela de faturas/cobranças mensais dos clientes';
COMMENT ON TABLE despesas IS 'Tabela de despesas operacionais da empresa';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Para verificar se tudo foi criado corretamente:
SELECT
    'Tabelas criadas com sucesso!' as mensagem,
    COUNT(*) as total_tabelas
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('clientes', 'veiculos', 'faturas', 'despesas');
