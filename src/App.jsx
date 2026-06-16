import React, { useState, useEffect, useCallback, useRef } from 'react'
import { db } from './supabase.js'

// ── utils ──────────────────────────────────────────────────────────────────
const eur = v => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v || 0)
const brl = v => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })
const sum = (a, f) => a.reduce((s, r) => s + (+r[f] || 0), 0)
const noites = r => r.entrada && r.saida ? Math.round((new Date(r.saida) - new Date(r.entrada)) / 864e5) : 0
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const mesL = m => { const [y, mo] = m.split('-'); return MESES[+mo - 1] + ' ' + y }
const MESES_DISPONIVEIS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06']

const todayISO = () => new Date().toISOString().slice(0, 10)

// ── nav config ─────────────────────────────────────────────────────────────
const NAV = [
  { k: 'dash',    label: 'Visão geral', sub: '2026',            initials: 'KR', bg: '#2A1F0A', fg: '#C9A84C', ac: '#C9A84C' },
  { k: 'vanessa', label: 'Vanessa',     sub: 'pessoal',         initials: 'VK', bg: '#1A1209', fg: '#E8C97A', ac: '#C9A84C' },
  { k: 'maezona', label: 'Mãezona',     sub: 'família',         initials: 'MK', bg: '#0A1F16', fg: '#5DCAA5', ac: '#1D9E75' },
  { k: 'milton',  label: 'Milton',      sub: 'concertos',       initials: 'MK', bg: '#160A2A', fg: '#A88AE8', ac: '#7C5FC4' },
  { k: 'villa',   label: 'Villa',       sub: 'Vilamoura',       initials: 'VL', bg: '#0A1F10', fg: '#6AD48A', ac: '#4CAF72' },
  { k: 'copa',    label: 'Copa',        sub: 'Rio de Janeiro',  initials: 'RJ', bg: '#0A1525', fg: '#6AAEE8', ac: '#3A7FC4' },
]

const TITLES = {
  dash: 'Visão geral — 2026', vanessa: 'Budget pessoal',
  maezona: 'Budget Mãezona', milton: 'Budget Milton',
  villa: 'Villa Vilamoura', copa: 'Copa — Rio de Janeiro',
}

// ── categoria cores ────────────────────────────────────────────────────────
const CAT_COLORS = {
  'animais':       { bg: '#FEF9C3', color: '#854D0E', border: '#FDE047' },
  'empregada':     { bg: '#FCE7F3', color: '#BE185D', border: '#F9A8D4' },
  'água':          { bg: '#E0F2FE', color: '#0369A1', border: '#7DD3FC' },
  'alimentação':   { bg: '#FFF3E0', color: '#B45309', border: '#FDE68A' },
  'casa':          { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  'habitação':     { bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
  'comunicações':  { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' },
  'condomínio':    { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
  'cuidadoras':    { bg: '#FDF2F8', color: '#9D174D', border: '#FBCFE8' },
  'energia':       { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  'família':       { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  'filhos':        { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  'financeiro':    { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  'retenção':      { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
  'farmácia':      { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  'saúde':         { bg: '#D1FAE5', color: '#047857', border: '#6EE7B7' },
  'gás':           { bg: '#FEFCE8', color: '#92400E', border: '#FEF08A' },
  'garagem':       { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
  'impostos':      { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  'internet':      { bg: '#ECFEFF', color: '#0E7490', border: '#A5F3FC' },
  'outros':        { bg: '#F9FAFB', color: '#4B5563', border: '#E5E7EB' },
  'pessoal':       { bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' },
  'seguros':       { bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' },
  'transporte':    { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD' },
  'crédito':       { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  'entretenimento':{ bg: '#FFF0F6', color: '#9D174D', border: '#FBCFE8' },
}

// categorias disponíveis para despesas Vanessa
const CATS_VANESSA = [
  'alimentação','animais','casa','filhos','financeiro','pessoal','saúde','transporte',
  'crédito','entretenimento','outros',
]

function CatBadge({ cat }) {
  const c = CAT_COLORS[cat] || CAT_COLORS['outros']
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
      letterSpacing: '.02em', display: 'inline-block', whiteSpace: 'nowrap',
    }}>{cat}</span>
  )
}
function Badge({ s }) {
  const m = { pago: ['g','Pago'], recebido: ['g','Recebido'], pendente: ['a','Pendente'], confirmado: ['b','Confirmado'], Done: ['g','Done'], 'In progress': ['a','Em curso'] }
  const [cls, lbl] = m[s] || ['a', s]
  return <span className={`badge ${cls}`}>{lbl}</span>
}

function Chip({ v }) {
  return <span className={`chip ${v >= 0 ? 'pos' : 'neg'}`}>{v >= 0 ? '↑' : '↓'} {eur(Math.abs(v))}</span>
}

function StatCard({ label, value, sub, ac = 'var(--gold2)', blur = false }) {
  return (
    <div className="stat-card" style={{ '--ac2': ac }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ filter: blur ? 'blur(8px)' : 'none', transition: 'filter .2s' }}>{value}</div>
      {sub && <div className="stat-sub" style={{ filter: blur ? 'blur(6px)' : 'none', transition: 'filter .2s' }}>{sub}</div>}
    </div>
  )
}

function SecHead({ label, onAdd }) {
  return (
    <div className="sec-head">
      <span className="sec-label">{label}</span>
      <div className="sec-line" />
      {onAdd && <button className="sec-add" onClick={onAdd}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Novo</button>}
    </div>
  )
}

function Tbl({ cols, rows, table, onSave }) {
  const [editing, setEditing] = useState(null)
  const [val, setVal] = useState('')
  const [confirming, setConfirming] = useState(null)

  const startEdit = (r, c) => {
    if (!c.edit || !table) return
    setEditing({ rowId: r.id, colK: c.k })
    setVal(r[c.k] ?? '')
  }

  const commitEdit = async (r, c) => {
    if (!editing) return
    setEditing(null)
    if (String(val) === String(r[c.k] ?? '')) return
    await db.update(table, r.id, { [c.k]: c.edit === 'number' ? +val : val })
    onSave && onSave()
  }

  const handleDelete = async (r) => {
    await db.remove(table, r.id)
    setConfirming(null)
    onSave && onSave()
  }

  if (!rows.length) return <div className="empty">Sem registos ainda</div>

  return (
    <div className="table-wrap">
      <table>
        <thead><tr>
          {cols.map(c => <th key={c.k} className={c.r ? 'r' : ''}>{c.l}</th>)}
          {table && <th style={{ width: 36 }} />}
        </tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const isConfirming = confirming === (r.id ?? i)
            if (isConfirming) {
              return (
                <tr key={r.id ?? i} style={{ background: '#FEF2F2' }}>
                  <td colSpan={cols.length} style={{ padding: '10px 13px', fontSize: 12.5, color: 'var(--red2)' }}>
                    Apagar este registo? Esta acção é irreversível.
                  </td>
                  <td style={{ whiteSpace: 'nowrap', padding: '10px 10px 10px 0', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(r)} style={{ background: '#A32D2D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', marginRight: 4 }}>Sim</button>
                    <button onClick={() => setConfirming(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text2)' }}>Não</button>
                  </td>
                </tr>
              )
            }
            return (
              <tr key={r.id ?? i}
                className="tbl-row"
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                {cols.map(c => {
                  const isEditing = editing && editing.rowId === r.id && editing.colK === c.k
                  const editable = !!c.edit && !!table
                  if (isEditing) {
                    return (
                      <td key={c.k} className={c.r ? 'r val' : c.n ? 'name' : ''} style={{ padding: 0 }}>
                        {c.edit === 'select'
                          ? <select autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => commitEdit(r, c)}
                              style={{ width: '100%', border: 'none', background: 'var(--bg2)', padding: '10px 13px', fontSize: 12.5, fontFamily: 'DM Sans, sans-serif', color: 'var(--text)', outline: '2px solid var(--gold2)', borderRadius: 0 }}>
                              {c.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          : <input autoFocus type={c.edit === 'number' ? 'number' : c.edit === 'date' ? 'date' : 'text'} value={val}
                              onChange={e => setVal(e.target.value)} onBlur={() => commitEdit(r, c)}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(r, c); if (e.key === 'Escape') setEditing(null) }}
                              style={{ width: '100%', border: 'none', background: 'var(--bg2)', padding: '10px 13px', fontSize: 12.5, fontFamily: 'DM Mono, monospace', color: 'var(--text)', outline: '2px solid var(--gold2)', borderRadius: 0 }} />
                        }
                      </td>
                    )
                  }
                  return (
                    <td key={c.k} className={c.r ? 'r val' : c.n ? 'name' : ''}
                      onClick={() => startEdit(r, c)}
                      style={editable ? { cursor: 'text', transition: 'background .1s' } : {}}
                      onMouseEnter={e => { if (editable) e.currentTarget.style.background = 'var(--bg2)' }}
                      onMouseLeave={e => { if (editable) e.currentTarget.style.background = '' }}>
                      {c.fn ? c.fn(r) : r[c.k] || '—'}
                    </td>
                  )
                })}
                {table && (
                  <td style={{ width: 36, textAlign: 'center', padding: '0 4px' }}>
                    <button className="del-btn" onClick={() => setConfirming(r.id ?? i)}
                      style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 15, padding: '4px 6px', borderRadius: 6, transition: 'opacity .15s, background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    ><i className="ti ti-trash" /></button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Tabs({ items, active, onChange }) {
  return (
    <div className="tab-row">
      {items.map(x => (
        <button key={x.k} className={`tab-btn ${active === x.k ? 'active' : ''}`} onClick={() => onChange(x.k)}>
          {x.l}
        </button>
      ))}
    </div>
  )
}

function Loading() {
  return <div className="loading"><i className="ti ti-loader" /> A carregar...</div>
}

// ── selector de mês ────────────────────────────────────────────────────────
function MonthSelector({ mes, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="month-pill"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', padding: 0 }}
      >
        <i className="ti ti-calendar" style={{ fontSize: 12, verticalAlign: -1 }} />
        {mesL(mes)}
        <i className="ti ti-chevron-down" style={{ fontSize: 11, opacity: 0.6, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '8px 0', zIndex: 9999,
          minWidth: 180, boxShadow: 'var(--shadow-xl)',
        }}>
          {MESES_DISPONIVEIS.map(m => {
            const active = m === mes
            return (
              <button
                key={m}
                onClick={() => { onChange(m); setOpen(false) }}
                onMouseEnter={e => { if (!active) e.target.style.background = 'var(--bg2)' }}
                onMouseLeave={e => { if (!active) e.target.style.background = 'none' }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 18px', background: active ? 'var(--bg2)' : 'none',
                  border: 'none', cursor: 'pointer', fontSize: 14,
                  color: active ? 'var(--gold2)' : 'var(--text)',
                  fontWeight: active ? 700 : 500,
                  fontFamily: 'inherit',
                  transition: 'all .15s',
                  borderRadius: 6,
                  margin: '0 6px',
                }}
              >
                {active && <i className="ti ti-point-filled" style={{ fontSize: 10, marginRight: 6, verticalAlign: 1 }} />}
                {!active && <span style={{ display: 'inline-block', width: 16 }} />}
                {mesL(m)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── relógio do topbar ──────────────────────────────────────────────────────
function TopbarClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  const dias = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']
  const mesesAbr = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  const hh = now.getHours().toString().padStart(2,'0')
  const mm = now.getMinutes().toString().padStart(2,'0')
  return (
    <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>{hh}:{mm}</div>
      <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'lowercase' }}>
        {dias[now.getDay()]} · {now.getDate()} {mesesAbr[now.getMonth()]} {now.getFullYear()}
      </div>
    </div>
  )
}

// ── constantes drawer ──────────────────────────────────────────────────────
const ESTADO_BTNS = [
  { k: 'pago',       label: 'pago',       icon: 'ti-check'    },
  { k: 'pendente',   label: 'pendente',   icon: 'ti-clock'    },
  { k: 'confirmado', label: 'confirmado', icon: 'ti-calendar' },
]
const ESTADO_COLORS = {
  pago:       { border: '#3B6D11', bg: '#EAF3DE', color: '#3B6D11' },
  pendente:   { border: '#854F0B', bg: '#FAEEDA', color: '#854F0B' },
  confirmado: { border: '#185FA5', bg: '#E6F1FB', color: '#185FA5' },
  recebido:   { border: '#3B6D11', bg: '#EAF3DE', color: '#3B6D11' },
  Done:       { border: '#3B6D11', bg: '#EAF3DE', color: '#3B6D11' },
  'In progress': { border: '#854F0B', bg: '#FAEEDA', color: '#854F0B' },
}

const DRAWER_CSS = `
  .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;animation:dfadeIn .2s}
  @keyframes dfadeIn{from{opacity:0}to{opacity:1}}
  .drawer-panel{position:fixed;top:0;right:0;bottom:0;width:min(400px,100vw);background:var(--bg);z-index:201;display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,.25);animation:dslideIn .28s cubic-bezier(.4,0,.2,1)}
  @keyframes dslideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
  .drawer-hd{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 14px;border-bottom:1px solid var(--border)}
  .drawer-hd-title{font-size:15px;font-weight:600;color:var(--text)}
  .drawer-close{background:none;border:1px solid var(--border);border-radius:50%;width:30px;height:30px;cursor:pointer;color:var(--text2);font-size:16px;display:flex;align-items:center;justify-content:center;line-height:1}
  .drawer-body{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:16px}
  .dfl{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);margin-bottom:6px;font-weight:500}
  .di{width:100%;box-sizing:border-box;font-size:14px;padding:9px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);outline:none;font-family:inherit;transition:border-color .15s}
  .cat-pill-grid{display:flex;flex-wrap:wrap;gap:7px}
  .cat-pill{padding:5px 13px;border-radius:20px;font-size:12px;cursor:pointer;border:1.5px solid transparent;transition:all .15s;font-weight:400;background:none}
  .cat-pill.sel{border-width:2px;font-weight:600}
  .estado-grid{display:flex;flex-wrap:wrap;gap:8px}
  .estado-pill{flex:1;min-width:80px;padding:9px 4px;border-radius:8px;font-size:12px;cursor:pointer;border:1px solid var(--border);background:var(--bg2);color:var(--text2);text-align:center;transition:all .15s;font-family:inherit}
  .drawer-foot{padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px}
  .drawer-btn-cancel{flex:1;padding:11px;border:1px solid var(--border);border-radius:8px;background:none;color:var(--text2);font-size:13px;cursor:pointer;font-family:inherit}
  .drawer-btn-save{flex:2;padding:11px;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
  .drawer-btn-save:disabled{opacity:.4;cursor:not-allowed}
`

// ── drawer genérico ────────────────────────────────────────────────────────
// fields: [{ k, l, t: 'text'|'date'|'number'|'money'|'sel'|'cat'|'estado', o: [], p: '' }]
// t='cat'  → badges coloridos (usa CAT_COLORS); passar o: ['cat1','cat2',...]
// t='estado' → pills coloridas; passar o: ['pago','pendente',...]
// t='money' → input text que aceita vírgula e ponto
function Drawer({ title, ac, fields, onClose, onSave }) {
  const init = {}
  fields.forEach(f => {
    if (f.t === 'date') init[f.k] = todayISO()
    else init[f.k] = ''
  })
  const [form, setForm] = useState(init)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const out = { ...form }
    fields.forEach(f => {
      if (f.t === 'money') out[f.k] = parseFloat((form[f.k] || '0').replace(',', '.')) || 0
      if (f.t === 'number') out[f.k] = +form[f.k] || 0
    })
    onSave(out)
  }

  const isValid = fields.every(f => {
    if (f.required === false) return true
    return form[f.k] !== '' && form[f.k] !== null && form[f.k] !== undefined
  })

  return (
    <>
      <style>{DRAWER_CSS}</style>
      <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()} />
      <div className="drawer-panel">
        <div className="drawer-hd">
          <span className="drawer-hd-title">{title}</span>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {fields.map(f => (
            <div key={f.k}>
              <div className="dfl">{f.l}</div>
              {f.t === 'cat' && (
                <div className="cat-pill-grid">
                  {f.o.map(cat => {
                    const c = CAT_COLORS[cat] || CAT_COLORS['outros']
                    const sel = form[f.k] === cat
                    return (
                      <button key={cat} className={`cat-pill${sel ? ' sel' : ''}`}
                        style={{ background: c.bg, color: c.color, borderColor: sel ? c.border : c.bg }}
                        onClick={() => set(f.k, cat)}>{cat}</button>
                    )
                  })}
                </div>
              )}
              {f.t === 'estado' && (
                <div className="estado-grid">
                  {f.o.map(k => {
                    const sel = form[f.k] === k
                    const c = ESTADO_COLORS[k] || ESTADO_COLORS['pendente']
                    const icons = { pago: 'ti-check', recebido: 'ti-check', pendente: 'ti-clock', confirmado: 'ti-calendar', Done: 'ti-check', 'In progress': 'ti-player-play' }
                    return (
                      <button key={k} className="estado-pill"
                        style={sel ? { borderColor: c.border, background: c.bg, color: c.color } : {}}
                        onClick={() => set(f.k, k)}>
                        <i className={`ti ${icons[k] || 'ti-circle'}`} style={{ fontSize: 13, marginRight: 4 }} />{k}
                      </button>
                    )
                  })}
                </div>
              )}
              {f.t === 'sel' && (
                <select className="di" value={form[f.k]} onChange={e => set(f.k, e.target.value)}
                  style={{ borderColor: form[f.k] ? `var(--border)` : `var(--border)` }}>
                  <option value="">Escolher...</option>
                  {f.o.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {f.t === 'money' && (
                <input className="di" type="text" inputMode="decimal" value={form[f.k]}
                  placeholder={f.p || '0,00'}
                  style={{ fontFamily: 'DM Mono, monospace' }}
                  onChange={e => set(f.k, e.target.value.replace(/[^0-9.,]/g, ''))}
                  onFocus={e => e.target.style.borderColor = ac}
                  onBlur={e => e.target.style.borderColor = ''} />
              )}
              {(f.t === 'text' || f.t === 'date' || f.t === 'number') && (
                <input className="di" type={f.t} value={form[f.k]} placeholder={f.p || ''}
                  onChange={e => set(f.k, e.target.value)}
                  onFocus={e => e.target.style.borderColor = ac}
                  onBlur={e => e.target.style.borderColor = ''} />
              )}
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <button className="drawer-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="drawer-btn-save" style={{ background: ac }} onClick={handleSave}>
            <i className="ti ti-device-floppy" style={{ fontSize: 14, marginRight: 6 }} />Guardar
          </button>
        </div>
      </div>
    </>
  )
}

// ── drawer freelance com cálculo automático ────────────────────────────────
function DrawerFreelance({ onClose, onSave, ac = 'var(--gold2)' }) {
  const [form, setForm] = useState({
    data: todayISO(), cliente: '', descricao: '',
    valor: '', retencao: 25, iva: 23, estado: 'pago',
    temRetencao: true, temIva: true,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const valorNum  = parseFloat((form.valor || '0').replace(',', '.')) || 0
  const retPct    = form.temRetencao ? (+form.retencao || 0) : 0
  const ivaPct    = form.temIva      ? (+form.iva || 0) : 0
  const retValor  = +(valorNum * retPct / 100).toFixed(2)
  const ivaValor  = +(valorNum * ivaPct / 100).toFixed(2)
  const totalDoc  = +(valorNum + ivaValor).toFixed(2)
  const totalPago = +(totalDoc - retValor).toFixed(2)

  const handleSave = () => onSave({ data: form.data, cliente: form.cliente, descricao: form.descricao, valor: valorNum, retencao: retPct, iva: ivaValor, estado: form.estado })

  return (
    <>
      <style>{DRAWER_CSS}</style>
      <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()} />
      <div className="drawer-panel">
        <div className="drawer-hd">
          <span className="drawer-hd-title">Novo recibo freelance</span>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="dfl">Data</div>
              <input className="di" type="date" value={form.data} onChange={e => set('data', e.target.value)} onFocus={e => e.target.style.borderColor=ac} onBlur={e => e.target.style.borderColor=''} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="dfl">Estado</div>
              <div className="estado-grid" style={{ flexDirection: 'column' }}>
                {['pago','pendente'].map(k => {
                  const sel = form.estado === k
                  const c = ESTADO_COLORS[k]
                  return <button key={k} className="estado-pill" style={sel ? { borderColor: c.border, background: c.bg, color: c.color } : {}} onClick={() => set('estado', k)}><i className={`ti ${k === 'pago' ? 'ti-check' : 'ti-clock'}`} style={{ fontSize: 13, marginRight: 4 }} />{k}</button>
                })}
              </div>
            </div>
          </div>
          <div><div className="dfl">Cliente</div><input className="di" type="text" value={form.cliente} onChange={e => set('cliente', e.target.value)} onFocus={e => e.target.style.borderColor=ac} onBlur={e => e.target.style.borderColor=''} /></div>
          <div><div className="dfl">Descrição</div><input className="di" type="text" value={form.descricao} onChange={e => set('descricao', e.target.value)} onFocus={e => e.target.style.borderColor=ac} onBlur={e => e.target.style.borderColor=''} /></div>
          <div><div className="dfl">Valor ilíquido (€)</div><input className="di" type="text" inputMode="decimal" value={form.valor} placeholder="0,00" style={{ fontFamily: 'DM Mono, monospace' }} onChange={e => set('valor', e.target.value.replace(/[^0-9.,]/g, ''))} onFocus={e => e.target.style.borderColor=ac} onBlur={e => e.target.style.borderColor=''} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="dfl" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={form.temRetencao} onChange={e => set('temRetencao', e.target.checked)} style={{ width: 'auto', margin: 0 }} /> Retenção IRS (%)
              </div>
              <input className="di" type="number" value={form.retencao} disabled={!form.temRetencao} onChange={e => set('retencao', e.target.value)} style={{ opacity: form.temRetencao ? 1 : 0.4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="dfl" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={form.temIva} onChange={e => set('temIva', e.target.checked)} style={{ width: 'auto', margin: 0 }} /> IVA (%)
              </div>
              <input className="di" type="number" value={form.iva} disabled={!form.temIva} onChange={e => set('iva', e.target.value)} style={{ opacity: form.temIva ? 1 : 0.4 }} />
            </div>
          </div>
          {valorNum > 0 && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 13px', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text2)' }}><span>Valor ilíquido</span><span style={{ fontFamily: 'DM Mono, monospace' }}>{eur(valorNum)}</span></div>
              {form.temIva && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text2)' }}><span>IVA {ivaPct}%</span><span style={{ fontFamily: 'DM Mono, monospace' }}>+ {eur(ivaValor)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text)', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 4 }}><span>Total do documento</span><span style={{ fontFamily: 'DM Mono, monospace' }}>{eur(totalDoc)}</span></div>
              {form.temRetencao && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--red2)' }}><span>Retenção IRS {retPct}%</span><span style={{ fontFamily: 'DM Mono, monospace' }}>− {eur(retValor)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 4 }}><span>Total a receber</span><span style={{ fontFamily: 'DM Mono, monospace' }}>{eur(totalPago)}</span></div>
            </div>
          )}
        </div>
        <div className="drawer-foot">
          <button className="drawer-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="drawer-btn-save" style={{ background: ac }} onClick={handleSave}><i className="ti ti-device-floppy" style={{ fontSize: 14, marginRight: 6 }} />Guardar</button>
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════

function Dashboard({ data, mes, blur = false }) {
  const vr = sum(data.vanessa_rendimentos.filter(x => x.mes === mes), 'valor')
  const vf = sum(data.vanessa_freelancers.filter(x => x.data && x.data.startsWith(mes)), 'valor')
  const vd = sum(data.vanessa_despesas.filter(x => x.mes === mes), 'valor')
  const md = sum(data.maezona_despesas.filter(x => x.mes === mes), 'valor')
  const mld = sum(data.milton_despesas.filter(x => x.mes === mes), 'valor')
  const vild = sum(data.maezona_despesas.filter(x => x.mes === mes && x.prop === 'Vilamoura'), 'valor')
  const tc = sum(data.milton_concertos, 'valor')
  const cR = sum(data.copa_receitas.filter(x => x.mes === mes), 'valor_brl')
  const cD = sum(data.copa_despesas.filter(x => x.mes === mes), 'valor_brl')

  return (
    <>
      <div className="stat-grid">
        <StatCard label="Rendimento Vanessa" value={eur(vr + vf)} sub={`${mesL(mes)} · inc. freelance`} ac="var(--gold2)" blur={blur} />
        <StatCard label="Despesas família PT" value={eur(vd + md + mld)} sub="Vanessa · Mãe · Milton" ac="var(--red2)" blur={blur} />
        <StatCard label="Saldo Vanessa" value={<Chip v={vr + vf - vd} />} sub={mesL(mes)} ac="var(--gold2)" blur={blur} />
        <StatCard label="Concertos Milton" value={eur(tc)} sub={`${data.milton_concertos.length} actuações`} ac="var(--violet2)" blur={blur} />
      </div>
      <div className="stat-grid">
        <StatCard label={`Copa — saldo ${mesL(mes)}`} value={brl(cR - cD)} sub={`≈ ${eur((cR - cD) * 0.18)} est.`} ac="var(--blue2)" blur={blur} />
        <StatCard label="Transferido PT" value={eur(sum(data.copa_transferencias, 'valor_eur'))} sub={`${data.copa_transferencias.length} transf.`} ac="var(--blue2)" blur={blur} />
        <StatCard label="Villa — reservas" value={`${data.villa_reservas.length} confirmadas`} sub="2026" ac="var(--green2)" blur={blur} />
        <StatCard label="Villa — despesas" value={eur(vild)} sub={mesL(mes)} ac="var(--green2)" blur={blur} />
      </div>
      <SecHead label={`Despesas por centro — ${mesL(mes)}`} />
      {[
        { l: 'Vanessa — casa + vida quotidiana', v: vd, max: 2500, c: 'var(--gold2)' },
        { l: 'Mãezona — Queluz + Vilamoura + diversos', v: md, max: 2500, c: 'var(--teal2)' },
        { l: 'Milton — casa Belas + seguros', v: mld, max: 1000, c: 'var(--violet2)' },
        { l: 'Villa Vilamoura — encargos fixos', v: vild, max: 500, c: 'var(--green2)' },
      ].map(x => (
        <div className="bar-card" key={x.l}>
          <div className="bar-top"><span className="bar-name">{x.l}</span><span className="bar-val">{eur(x.v)}</span></div>
          <div className="bar-track"><div className="bar-fill" style={{ background: x.c, width: `${Math.min(100, x.v / x.max * 100).toFixed(1)}%` }} /></div>
        </div>
      ))}
      <br />
      <SecHead label="Próximas reservas — Villa Vilamoura" />
      <Tbl
        cols={[
          { k: 'entrada', l: 'Check-in' }, { k: 'saida', l: 'Check-out' },
          { k: 'noites', l: 'Noites', fn: r => noites(r) },
          { k: 'tipo', l: 'Tipo' }, { k: 'inquilino', l: 'Hóspede', n: true },
          { k: 'canal', l: 'Canal' },
          { k: 'valor', l: 'Receita', r: true, fn: r => r.valor > 0 ? eur(r.valor) : '—' },
          { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> },
        ]}
        rows={data.villa_reservas}
      />
    </>
  )
}

function VanessaPage({ data, mes, reload, tab, setTab, blur = false }) {
  const [drawer, setDrawer] = useState(false)
  const [modal, setModal] = useState(null)
  const [catFiltro, setCatFiltro] = useState('todas')

  const desp = data.vanessa_despesas.filter(x => x.mes === mes)
  const rend = data.vanessa_rendimentos.filter(x => x.mes === mes)
  const free = data.vanessa_freelancers.filter(x => x.data && x.data.startsWith(mes))

  const salario = sum(rend.filter(x => x.tipo === 'Salário' || x.entidade === 'Bauer' || x.tipo === 'salario'), 'valor')
  const tf = sum(free, 'valor')
  const td = sum(desp, 'valor')
  const tr = sum(rend, 'valor')

  const cats = ['todas', ...Array.from(new Set(desp.map(x => x.categoria).filter(Boolean))).sort()]
  const despFiltradas = catFiltro === 'todas' ? desp : desp.filter(x => x.categoria === catFiltro)

  const saveDesp = async f => {
    // Construir data no formato YYYY-MM-DD se dia foi fornecido
    const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null
    await db.insert('vanessa_despesas', {
      mes,
      data: dataCompleta,
      categoria: f.categoria || 'outros',
      descricao: f.descricao,
      valor: f.valor,
    })
    reload()
    setDrawer(false)
  }

  const saveFree = async f => {
    await db.insert('vanessa_freelancers', {
      data: f.data, cliente: f.cliente, descricao: f.descricao,
      valor: +f.valor || 0, retencao: +f.retencao || 0,
      iva: +f.iva || 0, estado: f.estado || 'pago',
    })
    reload()
    setModal(null)
  }

  const saveRend = async f => {
    const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null
    await db.insert('vanessa_rendimentos', {
      mes, data: dataCompleta, tipo: f.tipo, entidade: f.entidade,
      valor: +f.valor || 0,
    })
    reload()
    setModal(null)
  }

  return (
    <>
      <div className="stat-grid">
        <StatCard
          label={`Rendimentos ${mesL(mes)}`}
          value={eur(tr + tf)}
          sub={`Bauer ${eur(salario)} · Freelance ${eur(tf)} · Abono ${eur(sum(rend.filter(x => x.tipo === 'Abono'), 'valor'))}`}
          ac="var(--gold2)"
          blur={blur}
        />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(td)} ac="var(--red2)" blur={blur} />
        <StatCard label="Saldo" value={<Chip v={tr + tf - td} />} sub={mesL(mes)} ac="var(--gold2)" blur={blur} />
      </div>
      <Tabs items={[{ k: 'desp', l: 'Despesas' }, { k: 'rend', l: 'Rendimentos' }, { k: 'free', l: 'Freelance' }]} active={tab} onChange={t => { setTab(t); setCatFiltro('todas') }} />

      {tab === 'desp' && (
        <>
          <div className="filter-row">
            {cats.map(c => {
              const col = CAT_COLORS[c] || CAT_COLORS['outros']
              const isActive = catFiltro === c
              return (
                <button
                  key={c}
                  className={`fpill ${isActive ? 'active' : ''}`}
                  onClick={() => setCatFiltro(c)}
                  style={isActive ? {} : { background: col.bg, borderColor: col.border, color: col.color }}
                >
                  {c === 'todas' ? 'Todas' : c}
                </button>
              )
            })}
          </div>
          <SecHead label={`Despesas — ${mesL(mes)}`} onAdd={() => setDrawer(true)} />
          <Tbl table="vanessa_despesas" onSave={reload} cols={[
            { k: 'data', l: 'Data', edit: 'date' },
            { k: 'descricao', l: 'Descrição', n: true, edit: 'text' },
            { k: 'categoria', l: 'Categoria', fn: r => <CatBadge cat={r.categoria} />, edit: 'select', options: CATS_VANESSA },
            { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
          ]} rows={despFiltradas} />
        </>
      )}
      {tab === 'rend' && (
        <>
          <SecHead label={`Rendimentos — ${mesL(mes)}`} onAdd={() => setModal('rend')} />
          <Tbl table="vanessa_rendimentos" onSave={reload} cols={[
            { k: 'data', l: 'Data', edit: 'date' },
            { k: 'tipo', l: 'Tipo', n: true, edit: 'text' },
            { k: 'entidade', l: 'Entidade', fn: r => r.entidade || '—', edit: 'text' },
            { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
          ]} rows={rend} />
        </>
      )}
      {tab === 'free' && (
        <>
          <SecHead label={`Freelance — ${mesL(mes)}`} onAdd={() => setModal('free')} />
          <Tbl table="vanessa_freelancers" onSave={reload} cols={[
            { k: 'data', l: 'Data', edit: 'date' },
            { k: 'cliente', l: 'Cliente', n: true, edit: 'text' },
            { k: 'descricao', l: 'Descrição', edit: 'text' },
            { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
            { k: 'retencao', l: 'Ret.', r: true, fn: r => r.retencao ? `${r.retencao}% · ${eur(r.valor * r.retencao / 100)}` : '—', edit: 'number' },
            { k: 'iva', l: 'IVA', r: true, fn: r => r.iva ? `23% · ${eur(r.iva)}` : '—', edit: 'number' },
            { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} />, edit: 'select', options: ['pago','pendente'] },
          ]} rows={free} />
        </>
      )}

      {drawer && (
        <Drawer
          title="Nova despesa — Vanessa"
          ac="var(--gold2)"
          fields={[
            { k: 'dia',       l: 'Dia',        t: 'number', p: '1-31' },
            { k: 'descricao', l: 'Descrição',  t: 'text', p: 'ex: supermercado, farmácia...' },
            { k: 'categoria', l: 'Categoria',  t: 'cat',  o: CATS_VANESSA },
            { k: 'valor',     l: 'Valor (€)',  t: 'money' },
          ]}
          onClose={() => setDrawer(false)}
          onSave={saveDesp}
        />
      )}
      {modal === 'free' && <DrawerFreelance ac="var(--gold2)" onClose={() => setModal(null)} onSave={saveFree} />}
      {modal === 'rend' && <Drawer title="Novo rendimento — Vanessa" ac="var(--gold2)" fields={[{ k: 'dia', l: 'Dia', t: 'number', p: '1-31' }, { k: 'tipo', l: 'Tipo', t: 'sel', o: ['salario','avenca','freelancer','outro'] }, { k: 'entidade', l: 'Entidade', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'money' }]} onClose={() => setModal(null)} onSave={saveRend} />}
    </>
  )
}

function MaezonaPage({ data, mes, reload, tab, setTab, blur = false }) {
  const [prop, setProp] = useState('todos')
  const [modal, setModal] = useState(false)
  const all = data.maezona_despesas.filter(x => x.mes === mes)
  const rend = (data.maezona_rendimentos || []).filter(x => x.mes === mes)
  const rows = prop === 'todos' ? all : all.filter(x => x.prop === prop)
  const q = sum(all.filter(x => x.prop === 'Queluz'), 'valor')
  const v = sum(all.filter(x => x.prop === 'Vilamoura'), 'valor')
  const dv = sum(all.filter(x => x.prop === 'Diversos'), 'valor')
  const tr = sum(rend, 'valor')
  const td = q + v + dv

  const save = async f => {
    const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null
    await db.insert('maezona_despesas', { mes, data: dataCompleta, prop: f.prop || 'Queluz', categoria: f.categoria || 'Outros', descricao: f.descricao, valor: +f.valor || 0 });
    reload();
    setModal(false)
  }

  return (
    <>
      <div className="stat-grid">
        <StatCard label="Rendimentos" value={eur(tr)} sub={mesL(mes)} ac="var(--teal2)" blur={blur} />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(td)} ac="var(--red2)" blur={blur} />
        <StatCard label="Saldo" value={<Chip v={tr - td} />} sub={mesL(mes)} ac="var(--teal2)" blur={blur} />
        <StatCard label="Queluz + Vilamoura" value={eur(q + v)} sub="casas" ac="var(--teal2)" blur={blur} />
      </div>
      <Tabs items={[{ k: 'desp', l: 'Despesas' }, { k: 'rend', l: 'Rendimentos' }]} active={tab} onChange={t => { setTab(t); setProp('todos') }} />
      {tab === 'desp' && (
        <>
          <div className="filter-row">
            {['todos', 'Queluz', 'Vilamoura', 'Diversos'].map(x => (
              <button key={x} className={`fpill ${prop === x ? 'active' : ''}`} onClick={() => setProp(x)}>{x === 'todos' ? 'Todas' : x}</button>
            ))}
          </div>
          <SecHead label={`Despesas — ${mesL(mes)}`} onAdd={() => setModal(true)} />
          <Tbl table="maezona_despesas" onSave={reload} cols={[
            { k: 'data', l: 'Data', edit: 'date' },
            { k: 'prop', l: 'Prop.', edit: 'select', options: ['Queluz','Vilamoura','Diversos'] },
            { k: 'categoria', l: 'Categoria', fn: r => <CatBadge cat={r.categoria} />, edit: 'select', options: ['condomínio','seguros','energia','água','garagem','comunicações','saúde','cuidadoras','alimentação','animais','empregada','outros'] },
            { k: 'descricao', l: 'Descrição', n: true, edit: 'text' },
            { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
          ]} rows={rows} />
        </>
      )}
      {tab === 'rend' && (
        <>
          <SecHead label={`Rendimentos — ${mesL(mes)}`} onAdd={() => setModal('rend')} />
          <Tbl table="maezona_rendimentos" onSave={reload} cols={[
            { k: 'data', l: 'Data', edit: 'date' },
            { k: 'tipo', l: 'Tipo', n: true, edit: 'select', options: ['pensão','transferência','IRS','outro'] },
            { k: 'entidade', l: 'Entidade', edit: 'text' },
            { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
          ]} rows={rend} />
        </>
      )}
      {modal === true && <Drawer title="Nova despesa — Mãezona" ac="var(--teal2)" fields={[{ k: 'dia', l: 'Dia', t: 'number', p: '1-31' }, { k: 'prop', l: 'Propriedade', t: 'sel', o: ['Queluz', 'Vilamoura', 'Diversos'] }, { k: 'categoria', l: 'Categoria', t: 'cat', o: ['condomínio','seguros','energia','água','garagem','comunicações','saúde','cuidadoras','alimentação','animais','empregada','outros'] }, { k: 'descricao', l: 'Descrição', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'money' }]} onClose={() => setModal(false)} onSave={save} />}
      {modal === 'rend' && <Drawer title="Novo rendimento — Mãezona" ac="var(--teal2)" fields={[{ k: 'dia', l: 'Dia', t: 'number', p: '1-31' }, { k: 'tipo', l: 'Tipo', t: 'sel', o: ['pensão','transferência','IRS','outro'] }, { k: 'entidade', l: 'Entidade', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'money' }]} onClose={() => setModal(false)} onSave={async f => { const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null; await db.insert('maezona_rendimentos', { mes, data: dataCompleta, tipo: f.tipo, entidade: f.entidade, valor: +f.valor || 0 }); reload(); setModal(false) }} />}
    </>
  )
}

function MiltonPage({ data, mes, reload, tab, setTab, blur = false }) {
  const [modal, setModal] = useState(null)
  const desp = data.milton_despesas.filter(x => x.mes === mes)
  const concMes = data.milton_concertos.filter(x => x.data && x.data.startsWith(mes))
  const concAno = data.milton_concertos

  const saveConc = async f => { await db.insert('milton_concertos', { data: f.data, descricao: f.descricao, entidade: f.entidade, nif: f.nif, localidade: f.localidade, valor: +f.valor || 0, iva: +f.iva || 0, estado: f.estado || 'Done' }); reload(); setModal(null) }

  return (
    <>
      <div className="stat-grid">
        <StatCard label={`Recebimentos ${mesL(mes)}`} value={eur(sum(concMes, 'valor'))} sub={`${concMes.length} actuações`} ac="var(--violet2)" blur={blur} />
        <StatCard label="IVA do mês" value={eur(sum(concMes, 'iva'))} ac="var(--violet2)" blur={blur} />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(sum(desp, 'valor'))} ac="var(--red2)" blur={blur} />
        <StatCard label="Total ano" value={eur(sum(concAno, 'valor'))} sub={`${concAno.length} actuações`} ac="var(--violet2)" blur={blur} />
      </div>
      <Tabs items={[{ k: 'conc', l: 'Concertos & Recibos' }, { k: 'desp', l: 'Despesas Casa Belas' }]} active={tab} onChange={setTab} />
      {tab === 'conc' && <><SecHead label={`Recibos verdes — ${mesL(mes)}`} onAdd={() => setModal('conc')} /><Tbl table="milton_concertos" onSave={reload} cols={[
        { k: 'data', l: 'Data', edit: 'date' },
        { k: 'descricao', l: 'Concerto', n: true, edit: 'text' },
        { k: 'entidade', l: 'Entidade', edit: 'text' },
        { k: 'localidade', l: 'Local', edit: 'text' },
        { k: 'nif', l: 'NIF', edit: 'text' },
        { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
        { k: 'iva', l: 'IVA', r: true, fn: r => r.iva ? eur(r.iva) : '—', edit: 'number' },
        { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} />, edit: 'select', options: ['Done','In progress'] },
      ]} rows={concMes} /></>}
      {tab === 'desp' && <><SecHead label={`Despesas — ${mesL(mes)}`} onAdd={() => setModal('desp')} /><Tbl table="milton_despesas" onSave={reload} cols={[
        { k: 'data', l: 'Data', edit: 'date' },
        { k: 'categoria', l: 'Categoria', fn: r => <CatBadge cat={r.categoria} />, edit: 'select', options: ['habitação','seguros','saúde','financeiro'] },
        { k: 'descricao', l: 'Descrição', n: true, edit: 'text' },
        { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor), edit: 'number' },
      ]} rows={desp} /></>}
      {modal === 'conc' && <Drawer title="Novo concerto — Milton" ac="var(--violet2)" fields={[{ k: 'data', l: 'Data', t: 'date' }, { k: 'descricao', l: 'Concerto', t: 'text' }, { k: 'entidade', l: 'Entidade', t: 'text' }, { k: 'nif', l: 'NIF', t: 'text' }, { k: 'localidade', l: 'Localidade', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'money' }, { k: 'iva', l: 'IVA (€)', t: 'money' }, { k: 'estado', l: 'Estado', t: 'estado', o: ['Done','In progress'] }]} onClose={() => setModal(null)} onSave={saveConc} />}
      {modal === 'desp' && <Drawer title="Nova despesa — Milton" ac="var(--violet2)" fields={[{ k: 'dia', l: 'Dia', t: 'number', p: '1-31' }, { k: 'categoria', l: 'Categoria', t: 'cat', o: ['habitação','seguros','saúde','financeiro'] }, { k: 'descricao', l: 'Descrição', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'money' }]} onClose={() => setModal(null)} onSave={async f => { const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null; await db.insert('milton_despesas', { mes, data: dataCompleta, categoria: f.categoria || 'outros', descricao: f.descricao, valor: +f.valor || 0 }); reload(); setModal(null) }} />}
    </>
  )
}

// ── calendário anual Villa ─────────────────────────────────────────────────
const VILLA_TIPOS = {
  'Irasine':    { cor: '#2E7D32', fg: '#fff',    label: 'Irasine'   },
  'Inquilino':  { cor: '#E65100', fg: '#fff',    label: 'Inquilino' },
  'Amigos':     { cor: '#7B3FA0', fg: '#fff',    label: 'Amigos'    },
  'Família':    { cor: '#1565C0', fg: '#fff',    label: 'Família'   },
}

function CalendarioVilla({ reservas, onDayClick }) {
  const ano = 2026
  const mesesNomes = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
  const diasSemana = ['S','D','S','T','Q','Q','S']

  // para cada dia do ano, determinar que reserva se aplica
  const getDayInfo = (mes0, dia) => {
    const dateStr = `${ano}-${String(mes0+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    for (const r of reservas) {
      if (!r.entrada || !r.saida) continue
      if (dateStr >= r.entrada && dateStr <= r.saida) {
        // Converter "Jonhy" antigo para "Inquilino"
        let tipo = r.tipo || 'Irasine'
        if (tipo === 'Jonhy' || (r.inquilino || '').toLowerCase().includes('jonh')) {
          tipo = 'Inquilino'
        }
        return { tipo, r }
      }
    }
    return null
  }

  const cellW = 32
  const cellH = 30
  const labelW = 100
  const headerH = 32
  const rowH = cellH + 1
  const diasPorSemana = 7
  const semanas = 6 // máximo de semanas que um mês pode ter
  const svgW = labelW + diasPorSemana * semanas * cellW + 10
  const svgH = headerH + 12 * rowH + 60

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <svg width={svgW} height={svgH} style={{ fontFamily: 'DM Sans, sans-serif', display: 'block' }}>
        {/* legenda */}
        {Object.entries(VILLA_TIPOS).map(([k, v], i) => (
          <g key={k} transform={`translate(${labelW + i * 110}, ${svgH - 44})`}>
            <rect width={16} height={16} rx={4} fill={v.cor} />
            <text x={22} y={12} fontSize={12} fill="var(--text2)" fontWeight={500}>{v.label}</text>
          </g>
        ))}
        <g transform={`translate(${labelW + Object.keys(VILLA_TIPOS).length * 110}, ${svgH - 44})`}>
          <rect width={16} height={16} rx={4} fill="var(--bg2)" stroke="var(--border)" strokeWidth={1.5} />
          <text x={22} y={12} fontSize={12} fill="var(--text2)" fontWeight={500}>Disponível</text>
        </g>

        {/* cabeçalho com dias da semana repetidos */}
        {Array.from({ length: semanas * diasPorSemana }, (_, i) => {
          const dow = i % 7
          const isWeekend = dow === 0 || dow === 1 // S ou D
          return (
            <g key={i} transform={`translate(${labelW + i * cellW}, 0)`}>
              <rect width={cellW - 1} height={headerH - 4} fill={isWeekend ? 'var(--bg2)' : 'transparent'} rx={2} />
              <text x={(cellW - 1) / 2} y={headerH / 2 + 4} fontSize={11} fontWeight={600}
                textAnchor="middle" fill={isWeekend ? 'var(--text)' : 'var(--text2)'}>
                {diasSemana[dow]}
              </text>
            </g>
          )
        })}

        {mesesNomes.map((nomeMes, mes0) => {
          const diasNoMes = new Date(ano, mes0 + 1, 0).getDate()
          const primeiroDia = new Date(ano, mes0, 1).getDay() // 0=Dom, 1=Seg...
          const y = headerH + mes0 * rowH

          return (
            <g key={mes0}>
              {/* nome do mês */}
              <text x={labelW - 10} y={y + cellH / 2 + 5} fontSize={11} fontWeight={700}
                textAnchor="end" fill="var(--text)" letterSpacing=".04em">
                {nomeMes}
              </text>

              {/* renderizar dias do mês */}
              {Array.from({ length: 42 }, (_, idx) => {
                const dia = idx - primeiroDia + 1
                const x = labelW + idx * cellW

                // células vazias antes do início do mês ou após o fim
                if (dia < 1 || dia > diasNoMes) {
                  return (
                    <rect key={idx} x={x} y={y} width={cellW - 1} height={cellH}
                      fill="var(--bg2)" opacity={0.3} rx={2} />
                  )
                }

                const info = getDayInfo(mes0, dia)
                const tipo = info ? info.tipo : null
                const cfg = tipo ? VILLA_TIPOS[tipo] : null
                const dateStr = `${ano}-${String(mes0+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
                const dow = new Date(dateStr).getDay()
                const isWeekend = dow === 0 || dow === 6
                const isToday = dateStr === new Date().toISOString().slice(0,10)
                const bg = cfg ? cfg.cor : (isWeekend ? 'var(--bg2)' : 'var(--bg)')
                const fg = cfg ? cfg.fg : 'var(--text)'

                return (
                  <g key={idx} onClick={() => onDayClick && onDayClick(dateStr, info)} style={{ cursor: 'pointer' }}>
                    <rect x={x} y={y} width={cellW - 1} height={cellH} rx={3}
                      fill={bg}
                      stroke={isToday ? '#F59E0B' : 'var(--border)'}
                      strokeWidth={isToday ? 2.5 : 0.5}
                      style={{ transition: 'opacity .15s' }}
                      onMouseEnter={e => e.target.style.opacity = '0.75'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    />
                    <text x={x + (cellW - 1) / 2} y={y + cellH / 2 + 5}
                      fontSize={11} textAnchor="middle"
                      fill={fg}
                      fontWeight={isToday ? 700 : cfg ? 600 : 400}
                      style={{ pointerEvents: 'none' }}>
                      {dia}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── calendário anual Copa ─────────────────────────────────────────────────
const COPA_CANAIS = {
  'RioHost': { cor: '#1565C0', fg: '#fff', label: 'RioHost' },
  'Booking':  { cor: '#2E7D32', fg: '#fff', label: 'Booking' },
  'Directo':  { cor: '#E65100', fg: '#fff', label: 'Directo' },
}

function CalendarioCopa({ receitas, onDayClick }) {
  const ano = 2026
  const mesesNomes = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
  const diasSemana = ['S','D','S','T','Q','Q','S']

  // Copa: receitas têm só `mes` (YYYY-MM), sem datas de check-in/check-out
  // colorir o mês inteiro com a cor do canal
  const getMesInfo = (mes0) => {
    const mesStr = `${ano}-${String(mes0+1).padStart(2,'0')}`
    const rec = receitas.filter(r => r.mes === mesStr)
    if (!rec.length) return null
    return rec[0]
  }

  const cellW = 32
  const cellH = 30
  const labelW = 100
  const headerH = 32
  const rowH = cellH + 1
  const diasPorSemana = 7
  const semanas = 6
  const svgW = labelW + diasPorSemana * semanas * cellW + 10
  const svgH = headerH + 12 * rowH + 60

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <svg width={svgW} height={svgH} style={{ fontFamily: 'DM Sans, sans-serif', display: 'block' }}>
        {/* legenda */}
        {Object.entries(COPA_CANAIS).map(([k, v], i) => (
          <g key={k} transform={`translate(${labelW + i * 110}, ${svgH - 44})`}>
            <rect width={16} height={16} rx={4} fill={v.cor} />
            <text x={22} y={12} fontSize={12} fill="var(--text2)" fontWeight={500}>{v.label}</text>
          </g>
        ))}
        <g transform={`translate(${labelW + Object.keys(COPA_CANAIS).length * 110}, ${svgH - 44})`}>
          <rect width={16} height={16} rx={4} fill="var(--bg2)" stroke="var(--border)" strokeWidth={1.5} />
          <text x={22} y={12} fontSize={12} fill="var(--text2)" fontWeight={500}>Disponível</text>
        </g>

        {/* cabeçalho com dias da semana */}
        {Array.from({ length: semanas * diasPorSemana }, (_, i) => {
          const dow = i % 7
          const isWeekend = dow === 0 || dow === 1
          return (
            <g key={i} transform={`translate(${labelW + i * cellW}, 0)`}>
              <rect width={cellW - 1} height={headerH - 4} fill={isWeekend ? 'var(--bg2)' : 'transparent'} rx={2} />
              <text x={(cellW - 1) / 2} y={headerH / 2 + 4} fontSize={11} fontWeight={600}
                textAnchor="middle" fill={isWeekend ? 'var(--text)' : 'var(--text2)'}>
                {diasSemana[dow]}
              </text>
            </g>
          )
        })}

        {mesesNomes.map((nomeMes, mes0) => {
          const diasNoMes = new Date(ano, mes0 + 1, 0).getDate()
          const primeiroDia = new Date(ano, mes0, 1).getDay()
          const y = headerH + mes0 * rowH
          const recInfo = getMesInfo(mes0)
          const canal = recInfo ? recInfo.canal : null
          const cfg = canal ? COPA_CANAIS[canal] : null

          return (
            <g key={mes0}>
              <text x={labelW - 10} y={y + cellH / 2 + 5} fontSize={11} fontWeight={700}
                textAnchor="end" fill="var(--text)" letterSpacing=".04em">
                {nomeMes}
              </text>

              {Array.from({ length: 42 }, (_, idx) => {
                const dia = idx - primeiroDia + 1
                const x = labelW + idx * cellW

                if (dia < 1 || dia > diasNoMes) {
                  return (
                    <rect key={idx} x={x} y={y} width={cellW - 1} height={cellH}
                      fill="var(--bg2)" opacity={0.3} rx={2} />
                  )
                }

                const dateStr = `${ano}-${String(mes0+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
                const mesStr = `${ano}-${String(mes0+1).padStart(2,'0')}`
                const dow = new Date(dateStr).getDay()
                const isWeekend = dow === 0 || dow === 6
                const isToday = dateStr === new Date().toISOString().slice(0,10)
                const bg = cfg ? cfg.cor : (isWeekend ? 'var(--bg2)' : 'var(--bg)')
                const fg = cfg ? cfg.fg : 'var(--text)'

                return (
                  <g key={idx} onClick={() => onDayClick && onDayClick(mesStr, recInfo)} style={{ cursor: 'pointer' }}>
                    <rect x={x} y={y} width={cellW - 1} height={cellH} rx={3}
                      fill={bg}
                      stroke={isToday ? '#F59E0B' : 'var(--border)'}
                      strokeWidth={isToday ? 2.5 : 0.5}
                      style={{ transition: 'opacity .15s' }}
                      onMouseEnter={e => e.target.style.opacity = '0.75'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    />
                    <text x={x + (cellW - 1) / 2} y={y + cellH / 2 + 5}
                      fontSize={11} textAnchor="middle"
                      fill={fg}
                      fontWeight={isToday ? 700 : cfg ? 600 : 400}
                      style={{ pointerEvents: 'none' }}>
                      {dia}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function VillaPage({ data, mes, reload, tab, setTab, blur = false }) {
  const [modal, setModal] = useState(null)
  const [calendarModal, setCalendarModal] = useState(null)
  const resAnо = data.villa_reservas
  const resMes = data.villa_reservas.filter(r => r.entrada && r.entrada.startsWith(mes))
  // encargos lidos da Mãezona, fonte única de verdade
  const desp = (data.maezona_despesas || []).filter(x => x.prop === 'Vilamoura' && x.mes === mes)
  // Receita: contar todas as reservas com valor, independente do tipo (Irasine, Jonhy, etc)
  const tr = sum(resMes.filter(r => r.valor > 0), 'valor')
  const td = sum(desp, 'valor')
  // Noites alugadas: contar reservas que geram receita (Irasine, Inquilino, Jonhy - não Amigos/Família)
  const noitesAnо = resAnо.filter(r => r.tipo === 'Irasine' || r.tipo === 'Inquilino' || r.tipo === 'Jonhy').reduce((s, r) => s + noites(r), 0)

  const saveRes = async f => { await db.insert('villa_reservas', { entrada: f.entrada, saida: f.saida, tipo: f.tipo || 'Inquilino', inquilino: f.inquilino, canal: f.canal || 'Directo', valor: +f.valor || 0, estado: f.estado || 'confirmado' }); reload(); setModal(null) }

  const handleDayClick = (date, info) => {
    setCalendarModal({ date, info })
  }

  const handleCalendarSave = async (tipo) => {
    const clickedDate = calendarModal.date

    // Se tipo for null, significa remover este dia específico
    if (!tipo && calendarModal.info) {
      const reserva = calendarModal.info.r
      const entrada = reserva.entrada
      const saida = reserva.saida

      // Se a reserva é de 1 dia apenas, remover completamente
      if (entrada === clickedDate && saida === clickedDate) {
        await db.remove('villa_reservas', reserva.id)
      } else {
        // Reserva multi-dia: dividir em dias individuais e remover o dia clicado
        const start = new Date(entrada)
        const end = new Date(saida)

        // Remover a reserva original
        await db.remove('villa_reservas', reserva.id)

        // Recriar os dias exceto o dia clicado
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const dayStr = d.toISOString().slice(0, 10)
          if (dayStr !== clickedDate) {
            await db.insert('villa_reservas', {
              entrada: dayStr,
              saida: dayStr,
              tipo: reserva.tipo,
              inquilino: reserva.inquilino,
              canal: reserva.canal || 'Directo',
              valor: 0,
              estado: reserva.estado || 'confirmado'
            })
          }
        }
      }
    } else if (tipo) {
      // Se já existe reserva neste dia, precisamos dividir a reserva
      if (calendarModal.info && calendarModal.info.r) {
        const reserva = calendarModal.info.r
        const entrada = reserva.entrada
        const saida = reserva.saida

        // Se a reserva é de 1 dia apenas, simplesmente atualizar
        if (entrada === clickedDate && saida === clickedDate) {
          await db.update('villa_reservas', reserva.id, {
            tipo: tipo,
            inquilino: tipo,
          })
        } else {
          // Reserva multi-dia: dividir em dias individuais
          const start = new Date(entrada)
          const end = new Date(saida)

          // Remover a reserva original
          await db.remove('villa_reservas', reserva.id)

          // Recriar os dias com o tipo apropriado
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dayStr = d.toISOString().slice(0, 10)
            await db.insert('villa_reservas', {
              entrada: dayStr,
              saida: dayStr,
              tipo: dayStr === clickedDate ? tipo : reserva.tipo,
              inquilino: dayStr === clickedDate ? tipo : reserva.inquilino,
              canal: reserva.canal || 'Directo',
              valor: 0,
              estado: reserva.estado || 'confirmado'
            })
          }
        }
      } else {
        // Adicionar nova reserva para este dia (1 dia apenas)
        await db.insert('villa_reservas', {
          entrada: clickedDate,
          saida: clickedDate,
          tipo: tipo,
          inquilino: tipo,
          canal: 'Directo',
          valor: 0,
          estado: 'confirmado'
        })
      }
    }
    reload()
    setCalendarModal(null)
  }

  return (
    <>
      <div className="stat-grid">
        <StatCard label={`Receita ${mesL(mes)}`} value={eur(tr)} sub={`${resMes.length} reservas`} ac="var(--green2)" blur={blur} />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(td)} sub="via Mãezona · Vilamoura" ac="var(--red2)" blur={blur} />
        <StatCard label="Resultado" value={<Chip v={tr - td} />} sub={mesL(mes)} ac="var(--green2)" blur={blur} />
        <StatCard label="Noites alugadas" value={`${noitesAnо} noites`} sub="2026" ac="var(--green2)" blur={blur} />
      </div>
      <div className="info-strip teal"><i className="ti ti-info-circle" /> Agosto: 650€/sem · 85€/dia &nbsp;|&nbsp; Outros meses: 600€/sem · 80€/dia</div>
      <Tabs items={[{ k: 'cal', l: 'Calendário 2026' }, { k: 'res', l: 'Reservas mês' }, { k: 'all', l: 'Todas as Reservas' }, { k: 'desp', l: 'Despesas' }]} active={tab} onChange={setTab} />
      {tab === 'cal' && <><SecHead label="Calendário de ocupação 2026 (clica num dia para editar)" onAdd={() => setModal('res')} /><CalendarioVilla reservas={resAnо} onDayClick={handleDayClick} /></>}
      {tab === 'res' && <><SecHead label={`Reservas — ${mesL(mes)}`} onAdd={() => setModal('res')} /><Tbl table="villa_reservas" onSave={reload} cols={[
        { k: 'entrada', l: 'Check-in', edit: 'date' },
        { k: 'saida', l: 'Check-out', edit: 'date' },
        { k: 'noites', l: 'Noites', fn: r => noites(r) },
        { k: 'tipo', l: 'Tipo', edit: 'select', options: ['Irasine','Inquilino','Amigos','Família'] },
        { k: 'inquilino', l: 'Hóspede', n: true, edit: 'text' },
        { k: 'canal', l: 'Canal', edit: 'select', options: ['Directo','Airbnb','Booking','Outro'] },
        { k: 'valor', l: 'Receita', r: true, fn: r => r.valor > 0 ? eur(r.valor) : '—', edit: 'number' },
        { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} />, edit: 'select', options: ['confirmado','pendente'] },
      ]} rows={resMes} /></>}
      {tab === 'all' && <><SecHead label="Todas as reservas 2026" onAdd={() => setModal('res')} /><Tbl table="villa_reservas" onSave={reload} cols={[
        { k: 'entrada', l: 'Check-in', edit: 'date' },
        { k: 'saida', l: 'Check-out', edit: 'date' },
        { k: 'noites', l: 'Noites', fn: r => noites(r) },
        { k: 'tipo', l: 'Tipo', edit: 'select', options: ['Irasine','Inquilino','Amigos','Família'] },
        { k: 'inquilino', l: 'Hóspede', n: true, edit: 'text' },
        { k: 'valor', l: 'Receita', r: true, fn: r => r.valor > 0 ? eur(r.valor) : '—', edit: 'number' },
        { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} />, edit: 'select', options: ['confirmado','pendente'] },
      ]} rows={resAnо} /></>}
      {tab === 'desp' && (
        <>
          <SecHead label={`Despesas Vilamoura — ${mesL(mes)}`} />
          <div className="info-strip teal" style={{ marginBottom: 12 }}><i className="ti ti-info-circle" /> Geridos em Mãezona · Vilamoura. Para adicionar ou editar, usa a página da Mãezona.</div>
          <Tbl cols={[
            { k: 'categoria', l: 'Categoria', fn: r => <CatBadge cat={r.categoria} /> },
            { k: 'descricao', l: 'Descrição', n: true },
            { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) },
          ]} rows={desp} />
        </>
      )}
      {modal === 'res' && <Drawer title="Nova reserva — Villa Vilamoura" ac="var(--green2)" fields={[{ k: 'entrada', l: 'Data entrada', t: 'date' }, { k: 'saida', l: 'Data saída', t: 'date' }, { k: 'tipo', l: 'Tipo', t: 'sel', o: ['Irasine','Inquilino','Amigos','Família'] }, { k: 'inquilino', l: 'Nome / Quem', t: 'text' }, { k: 'canal', l: 'Canal', t: 'sel', o: ['Directo','Airbnb','Booking','Outro'] }, { k: 'valor', l: 'Receita (€)', t: 'money' }, { k: 'estado', l: 'Estado', t: 'estado', o: ['confirmado','pendente'] }]} onClose={() => setModal(null)} onSave={saveRes} />}

      {calendarModal && (
        <>
          <style>{DRAWER_CSS}</style>
          <div className="drawer-overlay" onClick={() => setCalendarModal(null)} />
          <div className="drawer-panel" style={{ width: 'min(360px, 100vw)' }}>
            <div className="drawer-hd">
              <span className="drawer-hd-title">
                {new Date(calendarModal.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <button className="drawer-close" onClick={() => setCalendarModal(null)}>×</button>
            </div>
            <div className="drawer-body" style={{ gap: 10 }}>
              {calendarModal.info && (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Reserva actual</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: VILLA_TIPOS[calendarModal.info.tipo]?.cor || 'var(--border)'
                    }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {calendarModal.info.tipo}
                    </span>
                  </div>
                </div>
              )}
              <div className="dfl">{calendarModal.info ? 'Alterar para' : 'Escolher tipo'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(VILLA_TIPOS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => handleCalendarSave(k)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--bg2)',
                      cursor: 'pointer',
                      transition: 'all .15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = v.cor
                      e.currentTarget.style.background = v.cor + '10'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg2)'
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: v.cor }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{v.label}</span>
                  </button>
                ))}
              </div>
              {calendarModal.info && (
                <>
                  <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                  <button
                    onClick={() => handleCalendarSave(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--bg2)',
                      cursor: 'pointer',
                      transition: 'all .15s',
                      fontFamily: 'inherit',
                      color: 'var(--red2)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--red2)'
                      e.currentTarget.style.background = '#FEF2F2'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg2)'
                    }}
                  >
                    <i className="ti ti-trash" style={{ fontSize: 16 }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Remover reserva</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

function CopaPage({ data, mes, reload, tab, setTab, blur = false }) {
  const [modal, setModal] = useState(null)
  const [calendarModal, setCalendarModal] = useState(null)
  const recMes = data.copa_receitas.filter(x => x.mes === mes)
  const despMes = data.copa_despesas.filter(x => x.mes === mes)
  const recAnо = data.copa_receitas
  const despAnо = data.copa_despesas
  const tr = data.copa_transferencias
  const tRmes = sum(recMes, 'valor_brl')
  const tDmes = sum(despMes, 'valor_brl')
  const tRanо = sum(recAnо, 'valor_brl')
  const tDanо = sum(despAnо, 'valor_brl')

  const saveRec = async f => {
    const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null
    await db.insert('copa_receitas', { mes, data: dataCompleta, descricao: f.descricao || 'Aluguel AP 812', canal: f.canal || 'RioHost', valor_brl: +f.valor_brl || 0, taxa: +f.taxa || 0.18 });
    reload();
    setModal(null)
  }
  const saveTr = async f => { await db.insert('copa_transferencias', { data: f.data, valor_brl: +f.valor_brl || 0, valor_eur: +f.valor_eur || 0, notas: f.notas }); reload(); setModal(null) }

  const handleDayClick = (mesStr, info) => {
    setCalendarModal({ mes: mesStr, info })
  }

  const handleCalendarSave = async (canal) => {
    // Se canal for null, significa remover
    if (!canal && calendarModal.info) {
      // Remover a receita existente
      await db.remove('copa_receitas', calendarModal.info.id)
    } else if (canal) {
      // Se já existe receita neste mês, atualizar; senão criar nova
      if (calendarModal.info) {
        // Atualizar receita existente
        await db.update('copa_receitas', calendarModal.info.id, {
          canal: canal,
        })
      } else {
        // Adicionar nova receita para este mês
        await db.insert('copa_receitas', {
          mes: calendarModal.mes,
          data: null,
          descricao: 'Aluguel AP 812',
          canal: canal,
          valor_brl: 0,
          taxa: 0.18,
          estado: 'pago'
        })
      }
    }
    reload()
    setCalendarModal(null)
  }

  return (
    <>
      <div className="stat-grid">
        <StatCard label={`Receita ${mesL(mes)}`} value={brl(tRmes)} sub={recMes.length ? recMes[0].canal : '—'} ac="var(--blue2)" blur={blur} />
        <StatCard label={`Despesas ${mesL(mes)}`} value={brl(tDmes)} ac="var(--red2)" blur={blur} />
        <StatCard label={`Saldo ${mesL(mes)}`} value={brl(tRmes - tDmes)} ac={tRmes - tDmes >= 0 ? 'var(--green2)' : 'var(--red2)'} blur={blur} />
        <StatCard label="Transferido PT" value={eur(sum(tr, 'valor_eur'))} sub={`${tr.length} transf.`} ac="var(--blue2)" blur={blur} />
      </div>
      <div className="info-strip blue"><i className="ti ti-currency-real" /> Valores em BRL · Taxa referência: 1 BRL ≈ 0,18 EUR · Câmbio real por transferência</div>
      <Tabs items={[{ k: 'cal', l: 'Calendário 2026' }, { k: 'desp', l: 'Despesas' }, { k: 'rec', l: 'Receitas' }, { k: 'res', l: 'Resumo Ano' }, { k: 'tr', l: 'Transf. PT' }]} active={tab} onChange={setTab} />
      {tab === 'cal' && <><SecHead label="Calendário de ocupação 2026 (clica num dia para editar)" onAdd={() => setModal('rec')} /><CalendarioCopa receitas={recAnо} onDayClick={handleDayClick} /></>}
      {tab === 'desp' && <><SecHead label={`Despesas — ${mesL(mes)}`} onAdd={() => setModal('desp')} /><Tbl table="copa_despesas" onSave={reload} cols={[
        { k: 'data', l: 'Data', edit: 'date' },
        { k: 'categoria', l: 'Categoria', fn: r => <CatBadge cat={r.categoria} />, edit: 'select', options: ['condomínio','energia','gás','impostos','internet','retenção','seguros','outros'] },
        { k: 'descricao', l: 'Descrição', n: true, edit: 'text' },
        { k: 'valor_brl', l: 'BRL', r: true, fn: r => brl(r.valor_brl), edit: 'number' },
      ]} rows={despMes} /></>}
      {tab === 'rec' && <><SecHead label={`Receitas — ${mesL(mes)}`} onAdd={() => setModal('rec')} /><Tbl table="copa_receitas" onSave={reload} cols={[
        { k: 'data', l: 'Data', edit: 'date' },
        { k: 'descricao', l: 'Descrição', n: true, edit: 'text' },
        { k: 'canal', l: 'Canal', edit: 'select', options: ['RioHost','Booking','Directo'] },
        { k: 'valor_brl', l: 'BRL', r: true, fn: r => brl(r.valor_brl), edit: 'number' },
        { k: 'eur', l: '≈ EUR', r: true, fn: r => eur(r.valor_brl * (r.taxa || 0.18)) },
      ]} rows={recMes} /></>}
      {tab === 'res' && <><SecHead label="Resumo por mês 2026" /><Tbl cols={[{ k: 'mes', l: 'Mês', fn: r => mesL(r.mes), n: true }, { k: 'rec', l: 'Aluguel BRL', r: true, fn: r => brl(r.valor_brl) }, { k: 'desp', l: 'Despesas BRL', r: true, fn: r => brl(sum(despAnо.filter(d => d.mes === r.mes), 'valor_brl')) }, { k: 'saldo', l: 'Saldo', r: true, fn: r => { const s = r.valor_brl - sum(despAnо.filter(d => d.mes === r.mes), 'valor_brl'); return <span style={{ color: s >= 0 ? 'var(--green)' : 'var(--red2)', fontWeight: 600, fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{brl(s)}</span> } }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={recAnо} /></>}
      {tab === 'tr' && <><SecHead label="Transferências BRL → EUR" onAdd={() => setModal('tr')} /><Tbl cols={[{ k: 'data', l: 'Data' }, { k: 'notas', l: 'Referência', n: true }, { k: 'valor_brl', l: 'Enviado BRL', r: true, fn: r => brl(r.valor_brl) }, { k: 'valor_eur', l: 'Recebido EUR', r: true, fn: r => eur(r.valor_eur) }, { k: 'taxa', l: 'Taxa real', r: true, fn: r => r.valor_brl ? (r.valor_eur / r.valor_brl).toFixed(4) : '—' }]} rows={tr} /></>}
      {modal === 'desp' && <Drawer title="Nova despesa — Copa Rio" ac="var(--blue2)" fields={[{ k: 'dia', l: 'Dia', t: 'number', p: '1-31' }, { k: 'categoria', l: 'Categoria', t: 'cat', o: ['condomínio','energia','gás','impostos','internet','retenção','seguros','outros'] }, { k: 'descricao', l: 'Descrição', t: 'text' }, { k: 'valor_brl', l: 'Valor (BRL)', t: 'money' }]} onClose={() => setModal(null)} onSave={async f => { const dataCompleta = f.dia ? `${mes}-${String(f.dia).padStart(2, '0')}` : null; await db.insert('copa_despesas', { mes, data: dataCompleta, categoria: f.categoria || 'outros', descricao: f.descricao, valor_brl: +f.valor_brl || 0 }); reload(); setModal(null) }} />}
      {modal === 'rec' && <Drawer title="Nova receita — Copa Rio" ac="var(--blue2)" fields={[{ k: 'dia', l: 'Dia', t: 'number', p: '1-31' }, { k: 'descricao', l: 'Descrição', t: 'text', p: 'Aluguel AP 812' }, { k: 'canal', l: 'Canal', t: 'sel', o: ['RioHost','Booking','Directo'] }, { k: 'valor_brl', l: 'Valor (BRL)', t: 'money' }, { k: 'taxa', l: 'Taxa câmbio', t: 'text', p: '0.18' }]} onClose={() => setModal(null)} onSave={saveRec} />}
      {modal === 'tr' && <Drawer title="Nova transferência BRL → EUR" ac="var(--blue2)" fields={[{ k: 'data', l: 'Data', t: 'date' }, { k: 'valor_brl', l: 'Valor enviado (BRL)', t: 'money' }, { k: 'valor_eur', l: 'Valor recebido (EUR)', t: 'money' }, { k: 'notas', l: 'Referência', t: 'text', p: 'Ex: Jan-Mar 2026' }]} onClose={() => setModal(null)} onSave={saveTr} />}

      {calendarModal && (
        <>
          <style>{DRAWER_CSS}</style>
          <div className="drawer-overlay" onClick={() => setCalendarModal(null)} />
          <div className="drawer-panel" style={{ width: 'min(360px, 100vw)' }}>
            <div className="drawer-hd">
              <span className="drawer-hd-title">
                {mesL(calendarModal.mes)}
              </span>
              <button className="drawer-close" onClick={() => setCalendarModal(null)}>×</button>
            </div>
            <div className="drawer-body" style={{ gap: 10 }}>
              {calendarModal.info && (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Canal actual</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: COPA_CANAIS[calendarModal.info.canal]?.cor || 'var(--border)'
                    }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {calendarModal.info.canal}
                    </span>
                  </div>
                </div>
              )}
              <div className="dfl">{calendarModal.info ? 'Alterar para' : 'Escolher canal'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(COPA_CANAIS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => handleCalendarSave(k)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--bg2)',
                      cursor: 'pointer',
                      transition: 'all .15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = v.cor
                      e.currentTarget.style.background = v.cor + '10'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg2)'
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: v.cor }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{v.label}</span>
                  </button>
                ))}
              </div>
              {calendarModal.info && (
                <>
                  <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                  <button
                    onClick={() => handleCalendarSave(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--bg2)',
                      cursor: 'pointer',
                      transition: 'all .15s',
                      fontFamily: 'inherit',
                      color: 'var(--red2)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--red2)'
                      e.currentTarget.style.background = '#FEF2F2'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg2)'
                    }}
                  >
                    <i className="ti ti-trash" style={{ fontSize: 16 }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Remover receita</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════════
const TABLES = ['vanessa_rendimentos','vanessa_despesas','vanessa_freelancers','maezona_despesas','maezona_rendimentos','milton_despesas','milton_concertos','villa_reservas','copa_receitas','copa_despesas','copa_transferencias']

const PAGE_DEFAULT_TABS = { vanessa: 'desp', maezona: 'desp', milton: 'conc', villa: 'cal', copa: 'desp' }

export default function App() {
  const parseHash = () => {
    const hash = window.location.hash.replace('#', '')
    const [p, m, t] = hash.split('/')
    return { p, m, t }
  }
  const getInitialPage = () => { const { p } = parseHash(); return NAV.find(x => x.k === p) ? p : 'dash' }
  const getInitialMes  = () => { const { m } = parseHash(); return MESES_DISPONIVEIS.includes(m) ? m : '2026-01' }
  const getInitialTab  = (pageKey, validTabs) => {
    const { p, t } = parseHash()
    if (p === pageKey && t && validTabs.includes(t)) return t
    return PAGE_DEFAULT_TABS[pageKey]
  }

  const [page, setPage] = useState(getInitialPage)
  const [mes, setMes] = useState(getInitialMes)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [valuesVisible, setValuesVisible] = useState(true)
  const [vanessaTab, setVanessaTab] = useState(() => getInitialTab('vanessa', ['desp','rend','free']))
  const [maezonaTab, setMaezonaTab] = useState(() => getInitialTab('maezona', ['desp','rend']))
  const [miltonTab,  setMiltonTab]  = useState(() => getInitialTab('milton',  ['conc','desp']))
  const [villaTab,   setVillaTab]   = useState(() => getInitialTab('villa',   ['cal','res','all','desp']))
  const [copaTab,    setCopaTab]    = useState(() => getInitialTab('copa',    ['cal','desp','rec','res','tr']))

  // wrapper para setTab que também actualiza o hash
  const makeSetTab = (pageKey, setter) => (t) => {
    setter(t)
    const currentHash = window.location.hash.replace('#', '')
    const [p, m] = currentHash.split('/')
    window.location.hash = `${p}/${m}/${t}`
  }

  const navigate = (p, m) => {
    const newMes = m || mes
    const newPage = p || page
    // ao navegar para outra página, usa o tab por defeito dessa página
    const defaultTab = PAGE_DEFAULT_TABS[newPage] || ''
    window.location.hash = defaultTab ? `${newPage}/${newMes}/${defaultTab}` : `${newPage}/${newMes}`
    setPage(newPage)
    if (m) setMes(m)
  }

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const results = await Promise.all(TABLES.map(t => db.get(t)))
      const d = {}
      TABLES.forEach((t, i) => d[t] = results[i])
      setData(d)
    } catch (e) {
      console.error(e)
    }
    if (!silent) setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const n = NAV.find(x => x.k === page)

  const PAGES = {
    dash:    data ? <Dashboard data={data} mes={mes} blur={!valuesVisible} /> : null,
    vanessa: data ? <VanessaPage data={data} mes={mes} reload={() => load(true)} tab={vanessaTab} setTab={makeSetTab('vanessa', setVanessaTab)} blur={!valuesVisible} /> : null,
    maezona: data ? <MaezonaPage data={data} mes={mes} reload={() => load(true)} tab={maezonaTab} setTab={makeSetTab('maezona', setMaezonaTab)} blur={!valuesVisible} /> : null,
    milton:  data ? <MiltonPage  data={data} mes={mes} reload={() => load(true)} tab={miltonTab}  setTab={makeSetTab('milton',  setMiltonTab)}  blur={!valuesVisible} /> : null,
    villa:   data ? <VillaPage   data={data} mes={mes} reload={() => load(true)} tab={villaTab}   setTab={makeSetTab('villa',   setVillaTab)}   blur={!valuesVisible} /> : null,
    copa:    data ? <CopaPage    data={data} mes={mes} reload={() => load(true)} tab={copaTab}    setTab={makeSetTab('copa',    setCopaTab)}    blur={!valuesVisible} /> : null,
  }

  return (
    <div className="app">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        <div className="logo-block">
          <div className="logo-eyebrow">Gestão financeira</div>
          <div className="logo-name">Krithinas</div>
          <div className="logo-tag">família · 2026</div>
        </div>
        <div className="nav-section">
          {NAV.map(x => (
            <button
              key={x.k}
              className={`nav-item ${page === x.k ? 'active' : ''}`}
              style={{ '--ac': x.ac }}
              onClick={() => { navigate(x.k); setSidebarOpen(false) }}
            >
              <div className="nav-avatar" style={{ background: x.bg, color: x.fg, border: `1.5px solid ${page === x.k ? x.fg + '66' : 'transparent'}` }}>{x.initials}</div>
              <div className="nav-label-wrap">
                {x.label}
                <span className="nav-sublabel">{x.sub}</span>
              </div>
              {page === x.k && <div className="nav-pip" style={{ background: x.ac }} />}
            </button>
          ))}
        </div>
        <div className="sidebar-foot"><div className="sidebar-foot-text">v2.0 · Supabase</div></div>
      </nav>

      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <i className="ti ti-menu-2" />
            </button>
            <div>
              <div className="topbar-eyebrow" style={{ color: n.ac }}>{n.label} · {n.sub}</div>
              <div className="topbar-title">{TITLES[page]}</div>
            </div>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TopbarClock />
            <button
              onClick={() => setValuesVisible(!valuesVisible)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border2)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: valuesVisible ? 'var(--text2)' : 'var(--gold2)',
                transition: 'all .2s',
                boxShadow: 'var(--shadow-sm)',
              }}
              title={valuesVisible ? 'Ocultar valores' : 'Mostrar valores'}
            >
              <i className={`ti ${valuesVisible ? 'ti-eye' : 'ti-eye-off'}`} style={{ fontSize: 18 }} />
            </button>
            <MonthSelector mes={mes} onChange={m => navigate(null, m)} />
          </div>
        </header>

        <main className="content">
          {loading ? <Loading /> : PAGES[page]}
        </main>
      </div>
    </div>
  )
}
