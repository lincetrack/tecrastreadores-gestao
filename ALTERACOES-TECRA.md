# Alterações para Tecra Rastreadores

## Status das Alterações

### ✅ Concluído
- [x] Clone do repositório lincetrack-erp
- [x] Configuração das credenciais do Supabase
- [x] Alteração das cores de azul para vermelho (tailwind.config.ts)

### 🔄 Pendente - Aguardando informações do cliente

#### Informações Necessárias:
1. Nome completo da empresa
2. CNPJ
3. Endereço completo
4. CEP
5. Telefone de contato
6. E-mail de contato
7. Inscrição Estadual
8. Arquivos de logo (PNG e SVG)

#### Arquivos que precisam ser atualizados:

**1. Logo/Imagens:**
- `/public/logo-lince-track.svg` → substituir por logo da Tecra
- `/public/logo-lince-track-new.png` → substituir por logo da Tecra

**2. Nome da empresa nos componentes:**
- `src/components/Sidebar/Sidebar.tsx` (linha 59, 62)
- `src/components/Auth/LoginForm.tsx` (linha 41)
- `src/components/Propostas/PropostaModal.tsx` (linhas 109, 114, 258)
- `src/components/Faturas/InvoiceModal.tsx` (linhas 59, 64, 80)
- `src/pages/aniversariantes/index.tsx` (linha 56)
- `src/pages/_app.tsx` (linha 18)

**3. Dados da empresa (CNPJ, endereço, contatos):**
- `src/components/Propostas/PropostaModal.tsx` (linhas 116, 259)
- `src/components/Faturas/InvoiceModal.tsx` (linhas 80-83)

**4. Mensagens de WhatsApp:**
- `src/utils/formatters.ts` (linhas 37, 53)

**5. Documentação:**
- `README.md`
- `VALIDACAO-DATABASE.md`
- `supabase-schema.sql`

## Configuração do Supabase

### Credenciais configuradas em `.env.local`:
- URL: https://tcyogxcxtwylmyslzrun.supabase.co
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeW9neGN4dHd5bG15c2x6cnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjQyNDUsImV4cCI6MjA4MTQ0MDI0NX0.D4TC-HWivhHPgIMU-n5smfmJia5mWZOn6uIBSgNse2E
- Service Role Key: [configurado]

### Próximos passos no Supabase:
1. Executar o schema SQL: `supabase-schema.sql`
2. Executar as migrations se necessário

## Paleta de Cores Atualizada

### Cores Primárias (Vermelho):
- 50: #fef2f2
- 100: #fee2e2
- 200: #fecaca
- 300: #fca5a5
- 400: #f87171
- 500: #ef4444 (cor principal)
- 600: #dc2626
- 700: #b91c1c
- 800: #991b1b
- 900: #7f1d1d

## Repositório Git

- Repositório destino: https://github.com/lincetrack/tecrastreadores-gestao
- Aguardando configuração e push inicial
