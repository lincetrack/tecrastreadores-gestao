-- Migration: Add numero_fatura field to faturas table
-- Date: 2025-12-03
-- Description: Adds numero_fatura field to generate sequential invoice numbers starting from 10

-- Add the column
ALTER TABLE faturas
ADD COLUMN numero_fatura INTEGER;

-- Create a sequence starting from 10
CREATE SEQUENCE IF NOT EXISTS faturas_numero_seq START WITH 10;

-- Update existing records with sequential numbers starting from 10
UPDATE faturas
SET numero_fatura = nextval('faturas_numero_seq')
WHERE numero_fatura IS NULL;

-- Make the column NOT NULL after populating existing records
ALTER TABLE faturas
ALTER COLUMN numero_fatura SET NOT NULL;

-- Set default value for new records
ALTER TABLE faturas
ALTER COLUMN numero_fatura SET DEFAULT nextval('faturas_numero_seq');

-- Add unique constraint
ALTER TABLE faturas
ADD CONSTRAINT faturas_numero_fatura_unique UNIQUE (numero_fatura);

-- Add comment
COMMENT ON COLUMN faturas.numero_fatura IS 'Número sequencial da fatura para exibição (inicia em 10)';
