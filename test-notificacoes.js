import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('🔔 Testando sistema de notificações...\n')

// Tentar inserir uma notificação de teste
const { data, error } = await supabase
  .from('notificacoes')
  .insert({
    titulo: 'TESTE - pode apagar',
    descricao: 'Teste do sistema de notificações',
    categoria: 'vanessa',
    valor: 0,
    data_inicio: '2026-07-01',
    recorrencia: 'mensal',
    dia_vencimento: 1,
    ativo: true
  })
  .select()

if (error) {
  console.error('❌ Erro - tabela notificacoes ainda não existe!')
  console.error('Mensagem:', error.message)
  console.log('\n📝 Executa o SQL no Supabase SQL Editor:')
  console.log('https://supabase.com/dashboard/project/dmyaaxvlcmjplyymzrjl/sql/new')
  console.log('\nDepois copia o conteúdo de: create-notificacoes.sql')
} else {
  console.log('✅ Tabela notificacoes existe e funciona!')
  console.log('Notificação de teste criada:', data)
  console.log(`\n🗑️  Apaga com: DELETE FROM notificacoes WHERE id = ${data[0].id};`)
}
