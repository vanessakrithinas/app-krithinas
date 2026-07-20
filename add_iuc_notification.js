import { db } from './src/supabase.js'

async function addIUC() {
  try {
    const result = await db.insert('notificacoes', {
      titulo: 'IUC Dacia Duster',
      descricao: 'Imposto Único de Circulação - pagamento anual',
      valor: 95.00,
      data_inicio: '2026-09-01',
      recorrencia: 'anual',
      ativo: true
    })
    console.log('✅ Notificação IUC criada com sucesso!')
    console.log('   Valor: 95€ (ajusta se necessário)')
    console.log('   Mês: Setembro (anual)')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

addIUC()
