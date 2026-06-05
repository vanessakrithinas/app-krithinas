import { useState, useEffect, useCallback } from 'react'
import { db } from './supabase.js'

// ── utils ──────────────────────────────────────────────────────────────────
const eur = v => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v || 0)
const brl = v => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })
const sum = (a, f) => a.reduce((s, r) => s + (+r[f] || 0), 0)
const noites = r => r.entrada && r.saida ? Math.round((new Date(r.saida) - new Date(r.entrada)) / 864e5) : 0
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const mesL = m => { const [y, mo] = m.split('-'); return MESES[+mo - 1] + ' ' + y }
const MESES_DISPONIVEIS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06']

// ── nav config ─────────────────────────────────────────────────────────────
const NAV = [
  { k: 'dash',    label: 'Visão geral', sub: '2026',           initials: 'KR', bg: '#2A1F0A', fg: '#C9A84C', ac: '#C9A84C' },
  { k: 'vanessa', label: 'Vanessa',     sub: 'pessoal',        initials: 'VK', bg: '#1A1209', fg: '#E8C97A', ac: '#C9A84C' },
  { k: 'maezona', label: 'Mãezona',     sub: 'família',        initials: 'MK', bg: '#0A1F16', fg: '#5DCAA5', ac: '#1D9E75' },
  { k: 'milton',  label: 'Milton',      sub: 'concertos',      initials: 'MK', bg: '#160A2A', fg: '#A88AE8', ac: '#7C5FC4' },
  { k: 'villa',   label: 'Villa',       sub: 'Vilamoura',      initials: 'VL', bg: '#0A1F10', fg: '#6AD48A', ac: '#4CAF72' },
  { k: 'copa',    label: 'Copa',        sub: 'Rio de Janeiro',  initials: 'RJ', bg: '#0A1525', fg: '#6AAEE8', ac: '#3A7FC4' },
]

const TITLES = {
  dash: 'Visão geral — 2026', vanessa: 'Budget pessoal',
  maezona: 'Budget Mãezona', milton: 'Budget Milton',
  villa: 'Villa Vilamoura', copa: 'Copa — Rio de Janeiro',
}

// ── shared components ──────────────────────────────────────────────────────
function Badge({ s }) {
  const m = { pago: ['g','Pago'], recebido: ['g','Recebido'], pendente: ['a','Pendente'], confirmado: ['b','Confirmado'], Done: ['g','Done'], 'In progress': ['a','Em curso'] }
  const [cls, lbl] = m[s] || ['a', s]
  return <span className={`badge ${cls}`}>{lbl}</span>
}

function Chip({ v }) {
  return <span className={`chip ${v >= 0 ? 'pos' : 'neg'}`}>{v >= 0 ? '↑' : '↓'} {eur(Math.abs(v))}</span>
}

function StatCard({ label, value, sub, ac = 'var(--gold2)' }) {
  return (
    <div className="stat-card" style={{ '--ac2': ac }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
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

function Tbl({ cols, rows }) {
  if (!rows.length) return <div className="empty">Sem registos ainda</div>
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{cols.map(c => <th key={c.k} className={c.r ? 'r' : ''}>{c.l}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i}>
              {cols.map(c => (
                <td key={c.k} className={c.r ? 'r val' : c.n ? 'name' : ''}>
                  {c.fn ? c.fn(r) : r[c.k] || '—'}
                </td>
              ))}
            </tr>
          ))}
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
  const idx = MESES_DISPONIVEIS.indexOf(mes)
  const prev = () => idx > 0 && onChange(MESES_DISPONIVEIS[idx - 1])
  const next = () => idx < MESES_DISPONIVEIS.length - 1 && onChange(MESES_DISPONIVEIS[idx + 1])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={prev}
        disabled={idx === 0}
        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, color: 'var(--fg)', padding: '4px 6px', fontSize: 14 }}
      >‹</button>
      <span className="month-pill">
        <i className="ti ti-calendar" style={{ fontSize: 12, verticalAlign: -1 }} /> {mesL(mes)}
      </span>
      <button
        onClick={next}
        disabled={idx === MESES_DISPONIVEIS.length - 1}
        style={{ background: 'none', border: 'none', cursor: idx === MESES_DISPONIVEIS.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === MESES_DISPONIVEIS.length - 1 ? 0.3 : 1, color: 'var(--fg)', padding: '4px 6px', fontSize: 14 }}
      >›</button>
    </div>
  )
}

// ── modal ──────────────────────────────────────────────────────────────────
function Modal({ title, ac, fields, onClose, onSave }) {
  const [form, setForm] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hd">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {fields.map(f => (
          <div className="field" key={f.k}>
            <label>{f.l}</label>
            {f.t === 'sel'
              ? <select defaultValue="" onChange={e => set(f.k, e.target.value)}>
                  <option value="" disabled>Escolher...</option>
                  {f.o.map(o => <option key={o}>{o}</option>)}
                </select>
              : <input type={f.t} placeholder={f.p || ''} onChange={e => set(f.k, e.target.value)} />
            }
          </div>
        ))}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" style={{ background: ac }} onClick={() => onSave(form)}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════

function Dashboard({ data, mes }) {
  const vr = sum(data.vanessa_rendimentos.filter(x => x.mes === mes), 'valor')
  const vd = sum(data.vanessa_despesas.filter(x => x.mes === mes), 'valor')
  const md = sum(data.maezona_despesas.filter(x => x.mes === mes), 'valor')
  const mld = sum(data.milton_despesas.filter(x => x.mes === mes), 'valor')
  const vild = sum(data.villa_despesas.filter(x => x.mes === mes), 'valor')
  const tc = sum(data.milton_concertos, 'valor')
  const cR = sum(data.copa_receitas.filter(x => x.mes === mes), 'valor_brl')
  const cD = sum(data.copa_despesas.filter(x => x.mes === mes), 'valor_brl')

  return (
    <>
      <div className="stat-grid">
        <StatCard label="Rendimento Vanessa" value={eur(vr)} sub={mesL(mes)} ac="var(--gold2)" />
        <StatCard label="Despesas família PT" value={eur(vd + md + mld)} sub="Vanessa · Mãe · Milton" ac="var(--red2)" />
        <StatCard label="Saldo Vanessa" value={<Chip v={vr - vd} />} sub={mesL(mes)} ac="var(--gold2)" />
        <StatCard label="Concertos Milton" value={eur(tc)} sub={`${data.milton_concertos.length} actuações`} ac="var(--violet2)" />
      </div>
      <div className="stat-grid">
        <StatCard label={`Copa — saldo ${mesL(mes)}`} value={brl(cR - cD)} sub={`≈ ${eur((cR - cD) * 0.18)} est.`} ac="var(--blue2)" />
        <StatCard label="Transferido PT" value={eur(sum(data.copa_transferencias, 'valor_eur'))} sub={`${data.copa_transferencias.length} transf.`} ac="var(--blue2)" />
        <StatCard label="Villa — reservas" value={`${data.villa_reservas.length} confirmadas`} sub="2026" ac="var(--green2)" />
        <StatCard label="Villa — encargos" value={eur(vild)} sub={mesL(mes)} ac="var(--green2)" />
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

function VanessaPage({ data, mes, reload }) {
  const [tab, setTab] = useState('desp')
  const [modal, setModal] = useState(null)
  const [catFiltro, setCatFiltro] = useState('todas')

  const desp = data.vanessa_despesas.filter(x => x.mes === mes)
  const rend = data.vanessa_rendimentos.filter(x => x.mes === mes)
  const free = data.vanessa_freelancers
  const td = sum(desp, 'valor'), tr = sum(rend, 'valor'), tf = sum(free, 'valor')

  const cats = ['todas', ...Array.from(new Set(desp.map(x => x.categoria).filter(Boolean))).sort()]
  const despFiltradas = catFiltro === 'todas' ? desp : desp.filter(x => x.categoria === catFiltro)

  const saves = {
    desp: async f => { await db.insert('vanessa_despesas', { mes, categoria: f.categoria || 'outros', descricao: f.descricao, valor: +f.valor || 0, estado: f.estado || 'pago' }); reload(); setModal(null) },
    free: async f => { await db.insert('vanessa_freelancers', { data: f.data, cliente: f.cliente, descricao: f.descricao, valor: +f.valor || 0, retencao: +f.retencao || 0, iva: +f.iva || 0, estado: f.estado || 'pago' }); reload(); setModal(null) },
  }

  return (
    <>
      <div className="stat-grid">
        <StatCard label="Rendimento total" value={eur(tr + tf)} sub="Salário + freelance" ac="var(--gold2)" />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(td)} ac="var(--red2)" />
        <StatCard label="Saldo" value={<Chip v={tr + tf - td} />} sub={mesL(mes)} ac="var(--gold2)" />
        <StatCard label="IVA freelance" value={eur(sum(free, 'iva'))} sub="A declarar" ac="var(--gold2)" />
      </div>
      <Tabs items={[{ k: 'desp', l: 'Despesas' }, { k: 'rend', l: 'Rendimentos' }, { k: 'free', l: 'Freelance' }]} active={tab} onChange={t => { setTab(t); setCatFiltro('todas') }} />

      {tab === 'desp' && (
        <>
          <div className="filter-row">
            {cats.map(c => (
              <button key={c} className={`fpill ${catFiltro === c ? 'active' : ''}`} onClick={() => setCatFiltro(c)}>
                {c === 'todas' ? 'Todas' : c}
              </button>
            ))}
          </div>
          <SecHead label={`Despesas — ${mesL(mes)}`} onAdd={() => setModal('desp')} />
          <Tbl cols={[{ k: 'descricao', l: 'Descrição', n: true }, { k: 'categoria', l: 'Categoria' }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={despFiltradas} />
        </>
      )}
      {tab === 'rend' && (
        <>
          <SecHead label={`Rendimentos — ${mesL(mes)}`} />
          <Tbl cols={[{ k: 'tipo', l: 'Tipo', n: true }, { k: 'entidade', l: 'Entidade', fn: r => r.entidade || '—' }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={rend} />
        </>
      )}
      {tab === 'free' && (
        <>
          <SecHead label="Freelance 2026" onAdd={() => setModal('free')} />
          <Tbl cols={[{ k: 'data', l: 'Data' }, { k: 'cliente', l: 'Cliente', n: true }, { k: 'descricao', l: 'Descrição' }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'retencao', l: 'Ret.', r: true, fn: r => r.retencao ? r.retencao + '%' : '—' }, { k: 'iva', l: 'IVA', r: true, fn: r => r.iva ? eur(r.iva) : '—' }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={free} />
        </>
      )}
      {modal === 'desp' && <Modal title="Nova despesa — Vanessa" ac="var(--gold2)" fields={[{ k: 'descricao', l: 'Descrição', t: 'text' }, { k: 'categoria', l: 'Categoria', t: 'sel', o: ['home', 'filhos', 'alimentacao', 'transporte', 'saude', 'entretenimento', 'pessoal', 'financeiro'] }, { k: 'valor', l: 'Valor (€)', t: 'number' }, { k: 'estado', l: 'Estado', t: 'sel', o: ['pago', 'pendente'] }]} onClose={() => setModal(null)} onSave={saves.desp} />}
      {modal === 'free' && <Modal title="Novo recibo freelance" ac="var(--gold2)" fields={[{ k: 'data', l: 'Data', t: 'date' }, { k: 'cliente', l: 'Cliente', t: 'text' }, { k: 'descricao', l: 'Descrição', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'number' }, { k: 'retencao', l: 'Retenção (%)', t: 'number' }, { k: 'iva', l: 'IVA (€)', t: 'number' }, { k: 'estado', l: 'Estado', t: 'sel', o: ['pago', 'pendente'] }]} onClose={() => setModal(null)} onSave={saves.free} />}
    </>
  )
}

function MaezonaPage({ data, mes, reload }) {
  const [tab, setTab] = useState('desp')
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

  const save = async f => { await db.insert('maezona_despesas', { mes, prop: f.prop || 'Queluz', categoria: f.categoria || 'Outros', descricao: f.descricao, valor: +f.valor || 0, estado: f.estado || 'pago' }); reload(); setModal(false) }

  return (
    <>
      <div className="stat-grid">
        <StatCard label="Rendimentos" value={eur(tr)} sub={mesL(mes)} ac="var(--teal2)" />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(td)} ac="var(--red2)" />
        <StatCard label="Saldo" value={<Chip v={tr - td} />} sub={mesL(mes)} ac="var(--teal2)" />
        <StatCard label="Queluz + Vilamoura" value={eur(q + v)} sub="casas" ac="var(--teal2)" />
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
          <Tbl cols={[{ k: 'prop', l: 'Prop.' }, { k: 'categoria', l: 'Categoria' }, { k: 'descricao', l: 'Descrição', n: true }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={rows} />
        </>
      )}
      {tab === 'rend' && (
        <>
          <SecHead label={`Rendimentos — ${mesL(mes)}`} />
          <Tbl cols={[{ k: 'tipo', l: 'Tipo', n: true }, { k: 'entidade', l: 'Entidade' }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={rend} />
        </>
      )}
      {modal && <Modal title="Nova despesa — Mãezona" ac="var(--teal2)" fields={[{ k: 'prop', l: 'Propriedade', t: 'sel', o: ['Queluz', 'Vilamoura', 'Diversos'] }, { k: 'categoria', l: 'Categoria', t: 'sel', o: ['condominio', 'seguros', 'energia', 'agua', 'garagem', 'comunicacoes', 'saude', 'cuidadoras', 'alimentacao', 'outros'] }, { k: 'descricao', l: 'Descrição', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'number' }, { k: 'estado', l: 'Estado', t: 'sel', o: ['pago', 'pendente'] }]} onClose={() => setModal(false)} onSave={save} />}
    </>
  )
}

function MiltonPage({ data, mes, reload }) {
  const [tab, setTab] = useState('conc')
  const [modal, setModal] = useState(null)
  const desp = data.milton_despesas.filter(x => x.mes === mes)
  const concMes = data.milton_concertos.filter(x => x.data && x.data.startsWith(mes))
  const concAnо = data.milton_concertos

  const saveConc = async f => { await db.insert('milton_concertos', { data: f.data, descricao: f.descricao, entidade: f.entidade, nif: f.nif, localidade: f.localidade, valor: +f.valor || 0, iva: +f.iva || 0, estado: f.estado || 'Done' }); reload(); setModal(null) }

  return (
    <>
      <div className="stat-grid">
        <StatCard label={`Recebimentos ${mesL(mes)}`} value={eur(sum(concMes, 'valor'))} sub={`${concMes.length} actuações`} ac="var(--violet2)" />
        <StatCard label="IVA do mês" value={eur(sum(concMes, 'iva'))} ac="var(--violet2)" />
        <StatCard label={`Despesas ${mesL(mes)}`} value={eur(sum(desp, 'valor'))} ac="var(--red2)" />
        <StatCard label="Total ano" value={eur(sum(concAnо, 'valor'))} sub={`${concAnо.length} actuações`} ac="var(--violet2)" />
      </div>
      <Tabs items={[{ k: 'conc', l: 'Concertos & Recibos' }, { k: 'desp', l: 'Despesas Casa Belas' }]} active={tab} onChange={setTab} />
      {tab === 'conc' && <><SecHead label={`Recibos verdes — ${mesL(mes)}`} onAdd={() => setModal('conc')} /><Tbl cols={[{ k: 'data', l: 'Data' }, { k: 'descricao', l: 'Concerto', n: true }, { k: 'entidade', l: 'Entidade' }, { k: 'localidade', l: 'Local' }, { k: 'nif', l: 'NIF' }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'iva', l: 'IVA', r: true, fn: r => r.iva ? eur(r.iva) : '—' }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={concMes} /></>}
      {tab === 'desp' && <><SecHead label={`Despesas — ${mesL(mes)}`} /><Tbl cols={[{ k: 'categoria', l: 'Categoria' }, { k: 'descricao', l: 'Descrição', n: true }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={desp} /></>}
      {modal === 'conc' && <Modal title="Novo concerto — Milton" ac="var(--violet2)" fields={[{ k: 'data', l: 'Data', t: 'date' }, { k: 'descricao', l: 'Concerto', t: 'text' }, { k: 'entidade', l: 'Entidade', t: 'text' }, { k: 'nif', l: 'NIF', t: 'text' }, { k: 'localidade', l: 'Localidade', t: 'text' }, { k: 'valor', l: 'Valor (€)', t: 'number' }, { k: 'iva', l: 'IVA (€)', t: 'number' }, { k: 'estado', l: 'Estado', t: 'sel', o: ['Done', 'In progress'] }]} onClose={() => setModal(null)} onSave={saveConc} />}
    </>
  )
}

function VillaPage({ data, mes, reload }) {
  const [tab, setTab] = useState('res')
  const [modal, setModal] = useState(null)
  const resAnо = data.villa_reservas
  const resMes = data.villa_reservas.filter(r => r.entrada && r.entrada.startsWith(mes))
  const desp = data.villa_despesas.filter(x => x.mes === mes)
  const tr = sum(resMes.filter(r => r.tipo === 'Inquilino'), 'valor')
  const td = sum(desp, 'valor')
  const noitesAnо = resAnо.filter(r => r.tipo === 'Inquilino').reduce((s, r) => s + noites(r), 0)

  const saveRes = async f => { await db.insert('villa_reservas', { entrada: f.entrada, saida: f.saida, tipo: f.tipo || 'Inquilino', inquilino: f.inquilino, canal: f.canal || 'Directo', valor: +f.valor || 0, estado: f.estado || 'confirmado' }); reload(); setModal(null) }

  return (
    <>
      <div className="stat-grid">
        <StatCard label={`Receita ${mesL(mes)}`} value={eur(tr)} sub={`${resMes.length} reservas`} ac="var(--green2)" />
        <StatCard label={`Encargos ${mesL(mes)}`} value={eur(td)} ac="var(--red2)" />
        <StatCard label="Resultado" value={<Chip v={tr - td} />} sub={mesL(mes)} ac="var(--green2)" />
        <StatCard label="Noites alugadas" value={`${noitesAnо} noites`} sub="2026" ac="var(--green2)" />
      </div>
      <div className="info-strip teal"><i className="ti ti-info-circle" /> Agosto: 650€/sem · 85€/dia &nbsp;|&nbsp; Outros meses: 600€/sem · 80€/dia</div>
      <Tabs items={[{ k: 'res', l: 'Calendário & Reservas' }, { k: 'all', l: 'Todas as Reservas' }, { k: 'desp', l: 'Encargos Fixos' }]} active={tab} onChange={setTab} />
      {tab === 'res' && <><SecHead label={`Reservas — ${mesL(mes)}`} onAdd={() => setModal('res')} /><Tbl cols={[{ k: 'entrada', l: 'Check-in' }, { k: 'saida', l: 'Check-out' }, { k: 'noites', l: 'Noites', fn: r => noites(r) }, { k: 'tipo', l: 'Tipo' }, { k: 'inquilino', l: 'Hóspede', n: true }, { k: 'canal', l: 'Canal' }, { k: 'valor', l: 'Receita', r: true, fn: r => r.valor > 0 ? eur(r.valor) : '—' }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={resMes} /></>}
      {tab === 'all' && <><SecHead label="Todas as reservas 2026" onAdd={() => setModal('res')} /><Tbl cols={[{ k: 'entrada', l: 'Check-in' }, { k: 'saida', l: 'Check-out' }, { k: 'noites', l: 'Noites', fn: r => noites(r) }, { k: 'tipo', l: 'Tipo' }, { k: 'inquilino', l: 'Hóspede', n: true }, { k: 'valor', l: 'Receita', r: true, fn: r => r.valor > 0 ? eur(r.valor) : '—' }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={resAnо} /></>}
      {tab === 'desp' && <><SecHead label={`Encargos — ${mesL(mes)}`} /><Tbl cols={[{ k: 'categoria', l: 'Categoria' }, { k: 'descricao', l: 'Descrição', n: true }, { k: 'valor', l: 'Valor', r: true, fn: r => eur(r.valor) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={desp} /></>}
      {modal === 'res' && <Modal title="Nova reserva — Villa Vilamoura" ac="var(--green2)" fields={[{ k: 'entrada', l: 'Data entrada', t: 'date' }, { k: 'saida', l: 'Data saída', t: 'date' }, { k: 'tipo', l: 'Tipo', t: 'sel', o: ['Inquilino', 'Amigos', 'Família'] }, { k: 'inquilino', l: 'Nome / Quem', t: 'text' }, { k: 'canal', l: 'Canal', t: 'sel', o: ['Directo', 'Airbnb', 'Booking', 'Outro'] }, { k: 'valor', l: 'Receita (€)', t: 'number' }, { k: 'estado', l: 'Estado', t: 'sel', o: ['confirmado', 'pendente'] }]} onClose={() => setModal(null)} onSave={saveRes} />}
    </>
  )
}

function CopaPage({ data, mes, reload }) {
  const [tab, setTab] = useState('desp')
  const [modal, setModal] = useState(null)
  const recMes = data.copa_receitas.filter(x => x.mes === mes)
  const despMes = data.copa_despesas.filter(x => x.mes === mes)
  const recAnо = data.copa_receitas
  const despAnо = data.copa_despesas
  const tr = data.copa_transferencias
  const tRmes = sum(recMes, 'valor_brl')
  const tDmes = sum(despMes, 'valor_brl')
  const tRanо = sum(recAnо, 'valor_brl')
  const tDanо = sum(despAnо, 'valor_brl')

  const saveRec = async f => { await db.insert('copa_receitas', { mes, descricao: f.descricao || 'Aluguel AP 812', canal: f.canal || 'RioHost', valor_brl: +f.valor_brl || 0, taxa: +f.taxa || 0.18, estado: f.estado || 'recebido' }); reload(); setModal(null) }
  const saveTr = async f => { await db.insert('copa_transferencias', { data: f.data, valor_brl: +f.valor_brl || 0, valor_eur: +f.valor_eur || 0, notas: f.notas }); reload(); setModal(null) }

  return (
    <>
      <div className="stat-grid">
        <StatCard label={`Receita ${mesL(mes)}`} value={brl(tRmes)} sub={recMes.length ? recMes[0].canal : '—'} ac="var(--blue2)" />
        <StatCard label={`Despesas ${mesL(mes)}`} value={brl(tDmes)} ac="var(--red2)" />
        <StatCard label={`Saldo ${mesL(mes)}`} value={brl(tRmes - tDmes)} ac={tRmes - tDmes >= 0 ? 'var(--green2)' : 'var(--red2)'} />
        <StatCard label="Transferido PT" value={eur(sum(tr, 'valor_eur'))} sub={`${tr.length} transf.`} ac="var(--blue2)" />
      </div>
      <div className="info-strip blue"><i className="ti ti-currency-real" /> Valores em BRL · Taxa referência: 1 BRL ≈ 0,18 EUR · Câmbio real por transferência</div>
      <Tabs items={[{ k: 'desp', l: 'Despesas' }, { k: 'rec', l: 'Receitas' }, { k: 'res', l: 'Resumo Ano' }, { k: 'tr', l: 'Transf. PT' }]} active={tab} onChange={setTab} />
      {tab === 'desp' && <><SecHead label={`Despesas — ${mesL(mes)}`} /><Tbl cols={[{ k: 'categoria', l: 'Categoria' }, { k: 'descricao', l: 'Descrição', n: true }, { k: 'valor_brl', l: 'BRL', r: true, fn: r => brl(r.valor_brl) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={despMes} /></>}
      {tab === 'rec' && <><SecHead label={`Receitas — ${mesL(mes)}`} onAdd={() => setModal('rec')} /><Tbl cols={[{ k: 'descricao', l: 'Descrição', n: true }, { k: 'canal', l: 'Canal' }, { k: 'valor_brl', l: 'BRL', r: true, fn: r => brl(r.valor_brl) }, { k: 'eur', l: '≈ EUR', r: true, fn: r => eur(r.valor_brl * (r.taxa || 0.18)) }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={recMes} /></>}
      {tab === 'res' && <><SecHead label="Resumo por mês 2026" /><Tbl cols={[{ k: 'mes', l: 'Mês', fn: r => mesL(r.mes), n: true }, { k: 'rec', l: 'Aluguel BRL', r: true, fn: r => brl(r.valor_brl) }, { k: 'desp', l: 'Despesas BRL', r: true, fn: r => brl(sum(despAnо.filter(d => d.mes === r.mes), 'valor_brl')) }, { k: 'saldo', l: 'Saldo', r: true, fn: r => { const s = r.valor_brl - sum(despAnо.filter(d => d.mes === r.mes), 'valor_brl'); return <span style={{ color: s >= 0 ? 'var(--green)' : 'var(--red2)', fontWeight: 600, fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{brl(s)}</span> } }, { k: 'estado', l: 'Estado', fn: r => <Badge s={r.estado} /> }]} rows={recAnо} /></>}
      {tab === 'tr' && <><SecHead label="Transferências BRL → EUR" onAdd={() => setModal('tr')} /><Tbl cols={[{ k: 'data', l: 'Data' }, { k: 'notas', l: 'Referência', n: true }, { k: 'valor_brl', l: 'Enviado BRL', r: true, fn: r => brl(r.valor_brl) }, { k: 'valor_eur', l: 'Recebido EUR', r: true, fn: r => eur(r.valor_eur) }, { k: 'taxa', l: 'Taxa real', r: true, fn: r => r.valor_brl ? (r.valor_eur / r.valor_brl).toFixed(4) : '—' }]} rows={tr} /></>}
      {modal === 'rec' && <Modal title="Nova receita — Copa Rio" ac="var(--blue2)" fields={[{ k: 'descricao', l: 'Descrição', t: 'text', p: 'Aluguel AP 812' }, { k: 'canal', l: 'Canal', t: 'sel', o: ['RioHost', 'Booking', 'Airbnb', 'Directo'] }, { k: 'valor_brl', l: 'Valor (BRL)', t: 'number' }, { k: 'taxa', l: 'Taxa câmbio', t: 'number', p: '0.18' }, { k: 'estado', l: 'Estado', t: 'sel', o: ['recebido', 'pendente'] }]} onClose={() => setModal(null)} onSave={saveRec} />}
      {modal === 'tr' && <Modal title="Nova transferência BRL → EUR" ac="var(--blue2)" fields={[{ k: 'data', l: 'Data', t: 'date' }, { k: 'valor_brl', l: 'Valor enviado (BRL)', t: 'number' }, { k: 'valor_eur', l: 'Valor recebido (EUR)', t: 'number' }, { k: 'notas', l: 'Referência', t: 'text', p: 'Ex: Jan-Mar 2026' }]} onClose={() => setModal(null)} onSave={saveTr} />}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════════
const TABLES = ['vanessa_rendimentos','vanessa_despesas','vanessa_freelancers','maezona_despesas','maezona_rendimentos','milton_despesas','milton_concertos','villa_reservas','villa_despesas','copa_receitas','copa_despesas','copa_transferencias']

export default function App() {
  const [page, setPage] = useState('dash')
  const [mes, setMes] = useState('2026-01')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.all(TABLES.map(t => db.get(t)))
      const d = {}
      TABLES.forEach((t, i) => d[t] = results[i])
      setData(d)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const n = NAV.find(x => x.k === page)

  const PAGES = {
    dash:    data ? <Dashboard data={data} mes={mes} /> : null,
    vanessa: data ? <VanessaPage data={data} mes={mes} reload={load} /> : null,
    maezona: data ? <MaezonaPage data={data} mes={mes} reload={load} /> : null,
    milton:  data ? <MiltonPage data={data} mes={mes} reload={load} /> : null,
    villa:   data ? <VillaPage data={data} mes={mes} reload={load} /> : null,
    copa:    data ? <CopaPage data={data} mes={mes} reload={load} /> : null,
  }

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo-block">
          <div className="logo-eyebrow">Gestão financeira</div>
          <div className="logo-name">Krithinas</div>
          <div className="logo-tag">família · 2026</div>
        </div>
        <div className="nav-section">
          {NAV.map(x => (
            <button key={x.k} className={`nav-item ${page === x.k ? 'active' : ''}`} style={{ '--ac': x.ac }} onClick={() => setPage(x.k)}>
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
          <div>
            <div className="topbar-eyebrow" style={{ color: n.ac }}>{n.label} · {n.sub}</div>
            <div className="topbar-title">{TITLES[page]}</div>
          </div>
          <div className="topbar-right">
            <MonthSelector mes={mes} onChange={setMes} />
          </div>
        </header>

        <main className="content">
          {loading ? <Loading /> : PAGES[page]}
        </main>
      </div>
    </div>
  )
}
