import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(url, key)

// ── helpers ────────────────────────────────────────────────────────────────
export const db = {
  async get(table, filters = {}) {
    // Ordenar por data (descendente) se a coluna existir, caso contrário por id
    let q = supabase.from(table).select('*')

    // Tabelas que têm coluna 'data'
    const tablesWithData = [
      'vanessa_despesas', 'vanessa_rendimentos',
      'maezona_despesas', 'maezona_rendimentos',
      'milton_despesas', 'milton_concertos',
      'copa_despesas', 'copa_receitas', 'copa_transferencias',
      'villa_reservas'
    ]

    if (tablesWithData.includes(table)) {
      q = q.order('data', { ascending: false, nullsFirst: false }).order('id', { ascending: false })
    } else {
      q = q.order('id', { ascending: false })
    }

    for (const [col, val] of Object.entries(filters)) q = q.eq(col, val)
    const { data, error } = await q
    if (error) throw error
    return data
  },
  async insert(table, row) {
    const { data, error } = await supabase.from(table).insert(row).select().single()
    if (error) throw error
    return data
  },
  async update(table, id, row) {
    const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  },
}
