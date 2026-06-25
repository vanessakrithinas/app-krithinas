import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

console.log('🏖️  Adicionando reservas Copa 2026...\n')

// Apagar receita de teste
await supabase.from('copa_receitas').delete().eq('id', 137)
console.log('🗑️  Receita de teste removida')

const reservas = [
  // JANEIRO
  { mes: '2026-01', entrada: '2026-01-01', saida: '2026-01-02', descricao: 'Aluguel AP 812 - Jan', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-01', entrada: '2026-01-09', saida: '2026-01-14', descricao: 'Aluguel AP 812 - Jan', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-01', entrada: '2026-01-23', saida: '2026-01-29', descricao: 'Aluguel AP 812 - Jan', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  // FEVEREIRO
  { mes: '2026-02', entrada: '2026-02-19', saida: '2026-02-22', descricao: 'Aluguel AP 812 - Fev', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  // MARÇO
  { mes: '2026-03', entrada: '2026-03-11', saida: '2026-03-15', descricao: 'Aluguel AP 812 - Mar', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-03', entrada: '2026-03-17', saida: '2026-03-20', descricao: 'Aluguel AP 812 - Mar', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-03', entrada: '2026-03-22', saida: '2026-03-31', descricao: 'Aluguel AP 812 - Mar', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  // ABRIL
  { mes: '2026-04', entrada: '2026-04-01', saida: '2026-04-01', descricao: 'Aluguel AP 812 - Abr', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-04', entrada: '2026-04-08', saida: '2026-04-17', descricao: 'Aluguel AP 812 - Abr', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-04', entrada: '2026-04-18', saida: '2026-04-22', descricao: 'Aluguel AP 812 - Abr', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-04', entrada: '2026-04-28', saida: '2026-04-30', descricao: 'Aluguel AP 812 - Abr', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  // MAIO
  { mes: '2026-05', entrada: '2026-05-01', saida: '2026-05-04', descricao: 'Aluguel AP 812 - Mai', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  // JUNHO
  { mes: '2026-06', entrada: '2026-06-01', saida: '2026-06-10', descricao: 'Aluguel AP 812 - Jun', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  { mes: '2026-06', entrada: '2026-06-20', saida: '2026-06-30', descricao: 'Aluguel AP 812 - Jun', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
  // JULHO
  { mes: '2026-07', entrada: '2026-07-01', saida: '2026-07-12', descricao: 'Aluguel AP 812 - Jul', canal: 'RioHost', valor_brl: 0, taxa: 0.18 },
]

console.log(`📝 Inserindo ${reservas.length} reservas...\n`)

const { data, error } = await supabase
  .from('copa_receitas')
  .insert(reservas)
  .select()

if (error) {
  console.error('❌ Erro:', error.message)
} else {
  console.log(`✅ ${data.length} reservas adicionadas com sucesso!`)
  console.log('\n📅 Reservas criadas:')
  data.forEach(r => {
    console.log(`   ${r.entrada} até ${r.saida} - ${r.canal}`)
  })
  console.log('\n🎨 Vai ao Vercel e faz refresh - o calendário deve estar preenchido!')
}
