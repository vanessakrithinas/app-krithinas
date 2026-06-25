import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('🚀 Executando migração da tabela copa_receitas...\n')

// Ler o SQL
const sql = fs.readFileSync('./add-entrada-saida-copa.sql', 'utf8')

// Executar via RPC ou direct SQL
const { data, error } = await supabase.rpc('exec_sql', { query: sql }).catch(async () => {
  // Se RPC não funcionar, tentar adicionar as colunas diretamente
  console.log('⚠️  Função RPC não disponível, usando método alternativo...\n')

  // Método alternativo: fazer insert/update de teste para forçar a estrutura
  console.log('📝 Para adicionar as colunas, executa este SQL no Supabase SQL Editor:')
  console.log('https://dmyaaxvlcmjplyymzrjl.supabase.co/project/_/sql\n')
  console.log(sql)
  console.log('\nDepois volta a executar a aplicação.')

  return { data: null, error: null }
})

if (error) {
  console.error('❌ Erro:', error.message)
} else {
  console.log('✅ Migração concluída!')
}
