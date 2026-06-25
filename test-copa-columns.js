import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('🧪 Testando se as colunas entrada/saida existem...\n')

// Tentar inserir uma receita de teste com entrada/saida
const { data, error } = await supabase
  .from('copa_receitas')
  .insert({
    mes: '2026-01',
    entrada: '2026-01-01',
    saida: '2026-01-02',
    descricao: 'TESTE - pode apagar',
    canal: 'RioHost',
    valor_brl: 0,
    taxa: 0.18
  })
  .select()

if (error) {
  console.error('❌ Erro - as colunas ainda não existem!')
  console.error('Mensagem:', error.message)
  console.log('\n📝 Executa o SQL no Supabase primeiro:')
  console.log('ALTER TABLE copa_receitas ADD COLUMN IF NOT EXISTS entrada DATE, ADD COLUMN IF NOT EXISTS saida DATE;')
} else {
  console.log('✅ Sucesso! As colunas existem e o calendário vai funcionar!')
  console.log('Receita de teste criada:', data)
  console.log('\n🗑️  Podes apagar esta receita de teste na aplicação ou executar:')
  console.log(`DELETE FROM copa_receitas WHERE id = ${data[0].id};`)
}
