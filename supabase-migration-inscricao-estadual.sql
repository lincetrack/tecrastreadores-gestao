-- Migration: Add inscricao_estadual field to clientes table
-- Date: 2025-12-03
-- Description: Adds optional inscricao_estadual (state registration/RG) field to support both individual and corporate clients

ALTER TABLE clientes
ADD COLUMN inscricao_estadual VARCHAR(50);

-- Add comment to the column
COMMENT ON COLUMN clientes.inscricao_estadual IS 'Inscrição Estadual para empresas ou RG para pessoas físicas';
