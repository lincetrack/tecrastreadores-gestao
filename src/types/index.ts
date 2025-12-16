export interface Veiculo {
  id: string
  cliente_id?: string
  veiculo: string
  placa: string
  tipo_rastreador: string
  imei: string
  com_bloqueio: boolean
  numero_chip: string
  created_at?: string
  updated_at?: string
}

export interface Cliente {
  id: string
  nome: string
  cnpj: string
  inscricao_estadual?: string
  data_nascimento?: string
  telefone: string
  email?: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep?: string
  valor_mensalidade: number
  dia_vencimento: string
  ativo: boolean
  login_plataforma?: string
  veiculos: Veiculo[]
  created_at: string
  updated_at: string
}

export interface Fatura {
  id: string
  numero_fatura: number
  cliente_id: string
  cliente_nome: string
  descricao: string
  valor: number
  quantidade_veiculos: number
  data_vencimento: string
  data_emissao: string
  status: 'pendente' | 'pago'
  enviado_whatsapp: boolean
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Despesa {
  id: string
  descricao: string
  categoria: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  status: 'pendente' | 'pago' | 'atrasado'
  fornecedor?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  email: string
  nome: string
  role: 'admin' | 'financeiro' | 'operacional'
  created_at: string
}

export interface PropostaComercial {
  id: string
  numero_proposta: number

  // Dados do Prospect
  tipo_pessoa: 'fisica' | 'juridica'
  prospect_nome: string
  prospect_contato: string
  prospect_email: string
  prospect_telefone: string
  prospect_documento: string // CPF ou CNPJ
  prospect_cidade: string
  prospect_estado: string

  // Dados da Proposta
  tipo_equipamento: string
  plano: string
  valor_mensal: number
  quantidade_veiculos: number
  instalacao_gratuita: boolean
  valor_instalacao?: number
  prazo_permanencia: number // em meses

  // Informações adicionais
  observacoes?: string
  status: 'pendente' | 'enviada' | 'aprovada' | 'recusada'
  data_validade: string

  created_at: string
  updated_at: string
}
