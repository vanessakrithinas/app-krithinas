import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('🗑️  Limpando reservas Villa a partir de 25 julho 2026...\n')

// Buscar reservas que começam a partir de 25/07/2026
const { data: reservas, error: fetchError } = await supabase
  .from('villa_reservas')
  .select('*')
  .gte('entrada', '2026-07-25')
  .order('entrada', { ascending: true })

if (fetchError) {
  console.error('❌ Erro ao buscar reservas:', fetchError.message)
  process.exit(1)
}

if (!reservas || reservas.length === 0) {
  console.log('✅ Nenhuma reserva encontrada a partir de 25/07/2026')
  process.exit(0)
}

console.log(`📋 Encontradas ${reservas.length} reservas para remover:\n`)
reservas.forEach(r => {
  console.log(`   ${r.entrada} até ${r.saida} - ${r.tipo} - ${r.inquilino || 'sem nome'}`)
})

console.log('\n⚠️  Removendo...\n')

// Remover todas as reservas
const { error: deleteError } = await supabase
  .from('villa_reservas')
  .delete()
  .gte('entrada', '2026-07-25')

if (deleteError) {
  console.error('❌ Erro ao remover:', deleteError.message)
} else {
  console.log(`✅ ${reservas.length} reservas removidas com sucesso!`)
  console.log('🔄 Faz refresh na aplicação para ver as alterações')
}
