import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('Verificando estrutura da tabela copa_receitas...\n')

// Verificar dados atuais
const { data, error } = await supabase
  .from('copa_receitas')
  .select('*')
  .order('mes', { ascending: true })
  .limit(3)

if (error) {
  console.error('❌ Erro ao ler dados:', error.message)
} else {
  console.log('✅ Estrutura atual (primeiros 3 registos):')
  console.log(JSON.stringify(data, null, 2))

  if (data.length > 0) {
    const firstRecord = data[0]
    console.log('\n📋 Campos disponíveis:', Object.keys(firstRecord).join(', '))

    const hasEntrada = 'entrada' in firstRecord
    const hasSaida = 'saida' in firstRecord

    if (!hasEntrada || !hasSaida) {
      console.log('\n⚠️  Campos entrada/saida não existem na tabela')
      console.log('📝 É necessário adicionar as colunas na base de dados Supabase')
      console.log('\nSQL para executar no Supabase SQL Editor:')
      console.log('ALTER TABLE copa_receitas ADD COLUMN IF NOT EXISTS entrada DATE;')
      console.log('ALTER TABLE copa_receitas ADD COLUMN IF NOT EXISTS saida DATE;')
    } else {
      console.log('\n✅ Campos entrada/saida já existem!')
    }
  }
}
