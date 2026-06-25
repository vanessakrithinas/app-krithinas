-- Adicionar colunas entrada e saida à tabela copa_receitas
ALTER TABLE copa_receitas
ADD COLUMN IF NOT EXISTS entrada DATE,
ADD COLUMN IF NOT EXISTS saida DATE;

-- Comentário: As receitas existentes ficarão com entrada/saida NULL
-- O código está preparado para funcionar com:
-- 1. entrada/saida (intervalos) - nova forma
-- 2. data específica (dia único) - compatibilidade
-- 3. apenas mes (mês completo) - fallback para dados antigos
