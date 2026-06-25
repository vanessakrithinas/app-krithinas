import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('🧪 Testando campo pagamento em villa_reservas...\n')

// Tentar inserir uma reserva de teste com pagamento
const { data, error } = await supabase
  .from('villa_reservas')
  .insert({
    entrada: '2026-08-01',
    saida: '2026-08-01',
    tipo: 'Amigos',
    inquilino: 'TESTE - pode apagar',
    canal: 'Directo',
    valor: 0,
    estado: 'confirmado',
    pagamento: 'pago'
  })
  .select()

if (error) {
  console.error('❌ Erro - o campo pagamento ainda não existe!')
  console.error('Mensagem:', error.message)
  console.log('\n📝 Executa este SQL no Supabase:')
  console.log("ALTER TABLE villa_reservas ADD COLUMN IF NOT EXISTS pagamento VARCHAR(20) DEFAULT 'pendente';")
} else {
  console.log('✅ Campo pagamento existe e funciona!')
  console.log('Reserva de teste criada:', data)
  console.log(`\n🗑️  Apaga com: DELETE FROM villa_reservas WHERE id = ${data[0].id};`)
}
