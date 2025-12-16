# Tec Rastr - Sistema de Gestão

Sistema de gestão financeira para empresas de rastreamento veicular, desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.

## Funcionalidades

- **Dashboard** - Visão geral do financeiro com métricas em tempo real
- **Gestão de Faturas** - Controle completo de cobranças mensais recorrentes
  - Geração automática de faturas por período
  - Envio de cobrança via WhatsApp
  - Impressão/Download de faturas em PDF
  - Controle de status (pendente/pago)
- **Gestão de Despesas** - Controle de todas as despesas da empresa
  - Categorização de despesas
  - Controle de vencimentos e pagamentos
  - Relatórios por categoria
- **Gestão de Clientes** - Cadastro completo de clientes
  - Dados cadastrais completos (CNPJ, endereço, contatos)
  - Configuração de mensalidade e dia de vencimento
  - Controle de clientes ativos/inativos
- **Relatórios Gerenciais** - Análises e insights financeiros
- **Autenticação de Usuários** - Sistema seguro de login

## Tecnologias Utilizadas

- **Next.js 14** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Supabase** - Backend como serviço (autenticação e banco de dados)
- **React Query** - Gerenciamento de estado do servidor
- **Zustand** - Gerenciamento de estado global

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

4. Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
```

5. Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## Estrutura do Projeto

```
tecrastr-gestao/
├── src/
│   ├── components/     # Componentes React
│   │   ├── Auth/       # Componentes de autenticação
│   │   ├── Dashboard/  # Componentes do dashboard
│   │   ├── Layout/     # Componentes de layout
│   │   ├── Navbar/     # Barra de navegação
│   │   └── Sidebar/    # Menu lateral
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Configurações e utilitários
│   ├── pages/          # Páginas Next.js
│   ├── styles/         # Estilos globais
│   ├── types/          # Definições de tipos TypeScript
│   └── utils/          # Funções utilitárias
├── public/             # Arquivos estáticos
└── ...arquivos de configuração
```

## Licença

Este projeto é privado e confidencial.
