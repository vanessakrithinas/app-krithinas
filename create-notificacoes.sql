-- Criar tabela de notificações/lembretes
CREATE TABLE IF NOT EXISTS notificacoes (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50), -- 'maezona', 'vanessa', 'milton', 'villa', 'copa'
  valor DECIMAL(10,2),
  data_inicio DATE NOT NULL,
  recorrencia VARCHAR(20), -- 'mensal', 'trimestral', 'anual', 'unico'
  dia_vencimento INT, -- dia do mês (1-31)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para registar pagamentos/conclusões
CREATE TABLE IF NOT EXISTS notificacoes_historico (
  id BIGSERIAL PRIMARY KEY,
  notificacao_id BIGINT REFERENCES notificacoes(id) ON DELETE CASCADE,
  data_pagamento DATE NOT NULL,
  valor_pago DECIMAL(10,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir exemplo: Garagem 33 Mãezona
INSERT INTO notificacoes (titulo, descricao, categoria, valor, data_inicio, recorrencia, dia_vencimento)
VALUES (
  'Garagem 33 — Mãezona',
  'Pagamento trimestral da garagem (41€/mês × 3 meses = 123€)',
  'maezona',
  123.00,
  '2026-07-01',
  'trimestral',
  1
);

COMMENT ON TABLE notificacoes IS 'Lembretes e notificações de pagamentos recorrentes';
COMMENT ON TABLE notificacoes_historico IS 'Histórico de pagamentos/conclusões de notificações';
