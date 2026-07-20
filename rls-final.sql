-- ============================================================
-- ATIVAR RLS PARA TODAS AS TABELAS (Para usar com anon key)
-- ============================================================
-- COPIAR E COLAR NO SQL EDITOR DO SUPABASE DASHBOARD
-- ============================================================

-- NOTIFICACOES
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON notificacoes;
CREATE POLICY "Allow all for anon" ON notificacoes FOR ALL TO anon USING (true) WITH CHECK (true);

-- VANESSA
ALTER TABLE vanessa_despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON vanessa_despesas;
CREATE POLICY "Allow all for anon" ON vanessa_despesas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE vanessa_rendimentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON vanessa_rendimentos;
CREATE POLICY "Allow all for anon" ON vanessa_rendimentos FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE vanessa_freelancers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON vanessa_freelancers;
CREATE POLICY "Allow all for anon" ON vanessa_freelancers FOR ALL TO anon USING (true) WITH CHECK (true);

-- MAEZONA
ALTER TABLE maezona_despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON maezona_despesas;
CREATE POLICY "Allow all for anon" ON maezona_despesas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE maezona_rendimentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON maezona_rendimentos;
CREATE POLICY "Allow all for anon" ON maezona_rendimentos FOR ALL TO anon USING (true) WITH CHECK (true);

-- MILTON
ALTER TABLE milton_despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON milton_despesas;
CREATE POLICY "Allow all for anon" ON milton_despesas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE milton_concertos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON milton_concertos;
CREATE POLICY "Allow all for anon" ON milton_concertos FOR ALL TO anon USING (true) WITH CHECK (true);

-- COPA
ALTER TABLE copa_despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON copa_despesas;
CREATE POLICY "Allow all for anon" ON copa_despesas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE copa_receitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON copa_receitas;
CREATE POLICY "Allow all for anon" ON copa_receitas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE copa_transferencias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON copa_transferencias;
CREATE POLICY "Allow all for anon" ON copa_transferencias FOR ALL TO anon USING (true) WITH CHECK (true);

-- VILLA
ALTER TABLE villa_reservas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON villa_reservas;
CREATE POLICY "Allow all for anon" ON villa_reservas FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- VERIFICAÇÃO: O aviso vermelho deve desaparecer em todas as tabelas
-- ============================================================
