-- ============================================================
-- ATIVAR ROW LEVEL SECURITY NA TABELA NOTIFICACOES
-- ============================================================
-- CRITICAL: Esta tabela está PUBLICAMENTE ACESSÍVEL sem RLS
-- ============================================================

-- 1. Ativar RLS na tabela notificacoes
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- 2. Remover qualquer política existente (se houver)
DROP POLICY IF EXISTS "Enable read access for all users" ON notificacoes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON notificacoes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON notificacoes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON notificacoes;

-- 3. Criar políticas de acesso
-- Nota: Como estás a usar a anon key, vou permitir acesso total para authenticated users
-- Se quiseres restringir mais, podes adicionar condições específicas

-- Permitir leitura para utilizadores autenticados
CREATE POLICY "Enable read access for authenticated users"
ON notificacoes FOR SELECT
TO authenticated
USING (true);

-- Permitir inserção para utilizadores autenticados
CREATE POLICY "Enable insert for authenticated users"
ON notificacoes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir atualização para utilizadores autenticados
CREATE POLICY "Enable update for authenticated users"
ON notificacoes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir eliminação para utilizadores autenticados
CREATE POLICY "Enable delete for authenticated users"
ON notificacoes FOR DELETE
TO authenticated
USING (true);

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Após executar este script, verifica:
-- 1. No Supabase Dashboard > Table Editor > notificacoes
-- 2. O aviso de RLS deve desaparecer
-- 3. Testa o acesso com a aplicação para garantir que funciona
-- ============================================================
