-- Adicionar campo de pagamento à tabela villa_reservas
ALTER TABLE villa_reservas
ADD COLUMN IF NOT EXISTS pagamento VARCHAR(20) DEFAULT 'pendente';

-- Valores possíveis: 'pago', 'pendente'
-- Por defeito, todas as reservas existentes ficam como 'pendente'

COMMENT ON COLUMN villa_reservas.pagamento IS 'Estado do pagamento: pago ou pendente';
