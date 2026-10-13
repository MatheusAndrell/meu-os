import { useState } from 'react'
import { useStore } from '../store'
import { Chips, Empty, FormModal, Icon, PageHeader, Progress, useNewTrigger } from '../ui'
import { MonthBars, RankBars } from '../charts'
import { FIN_IN, FIN_OUT, finColor } from '../constants'
import { addMonths, brl, fmtDate, iso, monthKey, monthName, monthShort, sum } from '../utils'

const TX_FIELDS = [
  { name: 'type', label: 'Tipo', type: 'select', required: true, options: [{ value: 'out', label: 'Saída' }, { value: 'in', label: 'Entrada' }] },
  { name: 'amount', label: 'Valor (R$)', type: 'number', step: '0.01', min: 0, required: true },
  { name: 'desc', label: 'Descrição', required: true, full: true },
  { name: 'category', label: 'Categoria', type: 'select', required: true, options: (v) => (v.type === 'in' ? FIN_IN : FIN_OUT) },
  { name: 'date', label: 'Data', type: 'date', required: true },
]
const GOAL_FIELDS = [
  { name: 'name', label: 'Objetivo', required: true, full: true },
  { name: 'target', label: 'Meta (R$)', type: 'number', step: '0.01', min: 0, required: true },
  { name: 'current', label: 'Guardado (R$)', type: 'number', step: '0.01', min: 0 },
]

export default function Finance() {
  const { state, add, update, remove } = useStore()
  const [month, setMonth] = useState(() => addMonths(new Date(), 0))
  const [type, setType] = useState('all')
  const [edit, setEdit] = useState(null)
  const [goal, setGoal] = useState(null)
  const [deposit, setDeposit] = useState(null)
  const blank = () => ({ type: 'out', category: 'Mercado', date: iso(new Date()) })
  useNewTrigger('financas', () => setEdit(blank()))

  const mk = monthKey(month)
  const tx = state.transactions.filter((t) => t.date?.startsWith(mk)).sort((a, b) => b.date.localeCompare(a.date))
  const inc = sum(tx.filter((t) => t.type === 'in').map((t) => t.amount))
  const out = sum(tx.filter((t) => t.type === 'out').map((t) => t.amount))
  const rate = inc > 0 ? ((inc - out) / inc) * 100 : 0
  const list = tx.filter((t) => type === 'all' || t.type === type)
  const byCat = FIN_OUT.map((c) => ({ label: c, color: finColor(c), value: sum(tx.filter((t) => t.type === 'out' && t.category === c).map((t) => t.amount)) }))
    .filter((d) => d.value > 0).sort((a, b) => b.value - a.value)
  const history = Array.from({ length: 6 }, (_, i) => addMonths(month, i - 5)).map((d) => {
    const m = state.transactions.filter((t) => t.date?.startsWith(monthKey(d)))
    return { label: monthShort(d), in: sum(m.filter((t) => t.type === 'in').map((t) => t.amount)), out: sum(m.filter((t) => t.type === 'out').map((t) => t.amount)) }
  })

  return (
    <>
      <PageHeader n={5} kicker="Finanças" title="Dinheiro" accent="sob controle">
        <div className="month-nav">
          <button className="icon-btn" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Mês anterior"><Icon name="chevL" /></button>
          <span className="month-label">{monthName(month)}</span>
          <button className="icon-btn" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Próximo mês"><Icon name="chevR" /></button>
        </div>
        <button className="btn primary" onClick={() => setEdit(blank())}><Icon name="plus" size={16} /> Transação</button>
      </PageHeader>

      <div className="kpis four">
        <div className="card kpi"><span className="stat-label"><Icon name="up" size={14} className="t-mint" /> Entradas</span><span className="stat-value sm">{brl(inc)}</span></div>
        <div className="card kpi"><span className="stat-label"><Icon name="down" size={14} className="t-coral" /> Saídas</span><span className="stat-value sm">{brl(out)}</span></div>
        <div className="card kpi accent"><span className="stat-label">Saldo</span><span className="stat-value sm">{brl(inc - out)}</span></div>
        <div className="card kpi"><span className="stat-label">Taxa de poupança</span><span className="stat-value sm">{rate.toFixed(0)}%</span><Progress value={rate} color="var(--mint)" /></div>
      </div>

      <div className="fin-grid">
        <section className="card fin-tx">
          <div className="card-head">
            <h2>Transações</h2>
            <Chips value={type} onChange={setType} options={[{ value: 'all', label: 'Todas' }, { value: 'in', label: 'Entradas' }, { value: 'out', label: 'Saídas' }]} />
          </div>
          {list.length === 0 ? <Empty icon="wallet" title="Sem transações neste mês" /> : (
            <ul className="tx-list">
              {list.map((t) => (
                <li key={t.id}>
                  <button className="tx" onClick={() => setEdit(t)}>
                    <span className="tx-date mono">{fmtDate(t.date)}</span>
                    <span className="tx-desc">
                      {t.desc}
                      <small><i style={{ background: t.type === 'in' ? 'var(--mint)' : finColor(t.category) }} />{t.category}</small>
                    </span>
                    <span className={`tx-amount mono ${t.type === 'in' ? 't-mint' : ''}`}>{t.type === 'in' ? '+' : '−'} {brl(t.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="fin-side">
          <section className="card">
            <div className="card-head"><h2>Para onde foi</h2><span className="mono small muted">{brl(out)}</span></div>
            {byCat.length ? <RankBars data={byCat} /> : <p className="muted small">Nenhuma saída registrada.</p>}
          </section>
          <section className="card">
            <div className="card-head">
              <h2>Últimos 6 meses</h2>
              <div className="legend small"><span><i style={{ background: 'var(--mint)' }} />Entradas</span><span><i style={{ background: 'var(--coral)' }} />Saídas</span></div>
            </div>
            <MonthBars data={history} height={150} />
          </section>
        </div>
      </div>

      <section className="goals-section">
        <div className="group-head">
          <h2>Caixinhas & metas</h2>
          <button className="btn sm" onClick={() => setGoal({})}><Icon name="plus" size={14} /> Meta</button>
        </div>
        <div className="goals">
          {state.goals.map((g) => {
            const pct = g.target ? (g.current / g.target) * 100 : 0
            return (
              <article key={g.id} className="card goal">
                <div className="row between">
                  <h3>{g.name}</h3>
                  <button className="icon-btn sm ghost" onClick={() => setGoal(g)} aria-label={`Editar ${g.name}`}><Icon name="edit" size={15} /></button>
                </div>
                <div className="goal-ring" style={{ '--p': Math.min(100, pct) }}>
                  <span className="mono">{Math.round(pct)}%</span>
                </div>
                <div className="goal-nums mono small">
                  <span>{brl(g.current)}</span>
                  <span className="muted">de {brl(g.target)}</span>
                </div>
                <button className="btn sm full" onClick={() => setDeposit(g)}><Icon name="plus" size={14} /> Aportar</button>
              </article>
            )
          })}
          {state.goals.length === 0 && <Empty icon="target" title="Crie sua primeira meta" />}
        </div>
      </section>

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar transação' : 'Nova transação'}
        fields={TX_FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('transactions', edit.id, v) : add('transactions', v))}
        onDelete={edit?.id ? () => remove('transactions', edit.id) : null} />
      <FormModal open={!!goal} onClose={() => setGoal(null)} title={goal?.id ? 'Editar meta' : 'Nova meta'}
        fields={GOAL_FIELDS} initial={goal}
        onSubmit={(v) => (goal?.id ? update('goals', goal.id, v) : add('goals', { current: 0, ...v }))}
        onDelete={goal?.id ? () => remove('goals', goal.id) : null} />
      <FormModal open={!!deposit} onClose={() => setDeposit(null)} title={`Aportar em “${deposit?.name}”`} submitLabel="Aportar"
        fields={[{ name: 'amount', label: 'Valor (R$)', type: 'number', step: '0.01', required: true, full: true }]} initial={{}}
        onSubmit={(v) => update('goals', deposit.id, { current: (Number(deposit.current) || 0) + v.amount })} />
    </>
  )
}
