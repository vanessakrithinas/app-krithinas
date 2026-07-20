-- ============================================================
-- ATIVAR ROW LEVEL SECURITY EM TODAS AS TABELAS
-- ============================================================
-- CRITICAL: Proteger todas as tabelas do projeto
-- ============================================================

-- Lista de todas as tabelas do projeto:
-- vanessa_despesas, vanessa_rendimentos, vanessa_freelancers
-- maezona_despesas, maezona_rendimentos
-- milton_despesas, milton_concertos
-- copa_despesas, copa_receitas, copa_transferencias
-- villa_reservas
-- notificacoes

-- ============================================================
-- 1. TABELAS VANESSA
-- ============================================================

ALTER TABLE vanessa_despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON vanessa_despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE vanessa_rendimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON vanessa_rendimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE vanessa_freelancers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON vanessa_freelancers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 2. TABELAS MAEZONA
-- ============================================================

ALTER TABLE maezona_despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON maezona_despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE maezona_rendimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON maezona_rendimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 3. TABELAS MILTON
-- ============================================================

ALTER TABLE milton_despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON milton_despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE milton_concertos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON milton_concertos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 4. TABELAS COPA
-- ============================================================

ALTER TABLE copa_despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON copa_despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE copa_receitas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON copa_receitas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE copa_transferencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON copa_transferencias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 5. TABELA VILLA
-- ============================================================

ALTER TABLE villa_reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON villa_reservas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 6. TABELA NOTIFICACOES
-- ============================================================

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON notificacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Verifica todas as tabelas no Supabase Dashboard:
-- Table Editor > [nome da tabela] > RLS deve estar ativo
--
-- Se quiseres verificar via SQL:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('vanessa_despesas', 'vanessa_rendimentos',
--   'vanessa_freelancers', 'maezona_despesas', 'maezona_rendimentos',
--   'milton_despesas', 'milton_concertos', 'copa_despesas',
--   'copa_receitas', 'copa_transferencias', 'villa_reservas',
--   'notificacoes');
-- ============================================================
