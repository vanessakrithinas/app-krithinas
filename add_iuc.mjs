import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dmyaaxvlcmjplyymzrjl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRteWFheHZsY21qcGx5eW16cmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg1Njk1NDIsImV4cCI6MjAzNDE0NTU0Mn0.WT1bnkLPh4JkIOy2iOlv26DFzOLxUpIqpN26tfjjf58'
)

async function addIUC() {
  try {
    const { data, error } = await supabase
      .from('notificacoes')
      .insert({
        titulo: 'IUC Dacia Duster',
        descricao: 'Imposto Único de Circulação - pagamento anual',
        valor: 95.00,
        data_inicio: '2026-09-01',
        recorrencia: 'anual',
        ativo: true
      })
      .select()

    if (error) throw error

    console.log('✅ Notificação IUC criada com sucesso!')
    console.log('   📋 Título: IUC Dacia Duster')
    console.log('   💰 Valor: 95€ (ajusta se necessário)')
    console.log('   📅 Mês: Setembro (anual)')
    console.log('   ✓ Aparecerá todos os anos em Setembro')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

addIUC()
