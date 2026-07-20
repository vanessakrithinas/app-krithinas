import { createClient } from '@supabase/supabase-js'

// NOTA: Para executar SQL admin, precisas da SERVICE_ROLE key, não a anon key
// A anon key não tem permissões para ALTER TABLE e CREATE POLICY

const SUPABASE_URL = 'https://dmyaaxvlcmjplyymzrjl.supabase.co'

// ⚠️ IMPORTANTE: Substitui isto pela tua SERVICE_ROLE key (não a anon key!)
// Encontras no Supabase Dashboard > Project Settings > API > service_role key (secret)
const SERVICE_ROLE_KEY = 'SUBSTITUI_PELA_SERVICE_ROLE_KEY_AQUI'

console.log('⚠️  ATENÇÃO: Este script precisa da SERVICE_ROLE key')
console.log('📝 Encontra em: Supabase Dashboard > Project Settings > API > service_role')
console.log('')

if (SERVICE_ROLE_KEY === 'SUBSTITUI_PELA_SERVICE_ROLE_KEY_AQUI') {
  console.error('❌ Por favor, edita o ficheiro e substitui a SERVICE_ROLE_KEY')
  console.error('   Linha 9: const SERVICE_ROLE_KEY = "tua_service_role_key_aqui"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const tables = [
  'notificacoes',
  'vanessa_despesas',
  'vanessa_rendimentos',
  'vanessa_freelancers',
  'maezona_despesas',
  'maezona_rendimentos',
  'milton_despesas',
  'milton_concertos',
  'copa_despesas',
  'copa_receitas',
  'copa_transferencias',
  'villa_reservas'
]

async function enableRLS() {
  console.log('🔒 A ativar Row Level Security em todas as tabelas...\n')

  for (const table of tables) {
    try {
      // Ativar RLS
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      })

      if (rlsError) {
        // Tentar método alternativo se rpc não funcionar
        console.log(`⚠️  Tabela ${table}: ${rlsError.message}`)
        continue
      }

      // Criar política permissiva (permite tudo para anon)
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Allow all for anon" ON ${table};
          CREATE POLICY "Allow all for anon" ON ${table}
          FOR ALL TO anon
          USING (true)
          WITH CHECK (true);
        `
      })

      if (policyError) {
        console.log(`⚠️  Política ${table}: ${policyError.message}`)
      } else {
        console.log(`✅ ${table} - RLS ativado e política criada`)
      }

    } catch (error) {
      console.error(`❌ Erro na tabela ${table}:`, error.message)
    }
  }

  console.log('\n✨ Processo concluído!')
  console.log('⚠️  Se viste erros, precisas executar o SQL manualmente no dashboard')
}

enableRLS()
