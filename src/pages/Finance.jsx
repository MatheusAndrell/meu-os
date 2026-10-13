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
  const tx = state.transactions.filter((t) => t.date?.startsWith(mk)).sort((a, b) => a.date.localeCompare(b.date))
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
  let running = 0

  return (
    <>
      <PageHeader n={5} title="Livro-caixa" meta={monthName(month)}>
        <div className="month-nav">
          <button className="icon-btn" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Mês anterior"><Icon name="chevL" /></button>
          <span className="month-label mono">{monthShort(month)} {month.getFullYear()}</span>
          <button className="icon-btn" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Próximo mês"><Icon name="chevR" /></button>
        </div>
        <button className="btn primary" onClick={() => setEdit(blank())}><Icon name="plus" size={16} /> Lançamento</button>
      </PageHeader>

      <div className="cells c4 money">
        <div className="cell stat"><span className="cell-label mono">Entradas</span><span className="stat-num md">{brl(inc)}</span></div>
        <div className="cell stat"><span className="cell-label mono">Saídas</span><span className="stat-num md">{brl(out)}</span></div>
        <div className="cell stat cell-signal"><span className="cell-label mono">Saldo</span><span className="stat-num md">{brl(inc - out)}</span></div>
        <div className="cell stat">
          <span className="cell-label mono">Taxa de poupança</span>
          <span className="stat-num md">{rate.toFixed(0)}%</span>
          <Progress value={rate} color="var(--green)" />
        </div>
      </div>

      <div className="cells fin-grid">
        <section className="cell">
          <header className="cell-head">
            <h2>Lançamentos</h2>
            <Chips value={type} onChange={setType} options={[{ value: 'all', label: 'Todos' }, { value: 'in', label: 'Entradas' }, { value: 'out', label: 'Saídas' }]} />
          </header>
          {list.length === 0 ? <Empty title="Sem lançamentos neste mês" /> : (
            <div className="ledger-wrap">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Data</th><th>Descrição</th><th className="hide-sm">Categoria</th>
                    <th className="num">Entrada</th><th className="num">Saída</th><th className="num hide-sm">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => {
                    running += t.type === 'in' ? t.amount : -t.amount
                    return (
                      <tr key={t.id} onClick={() => setEdit(t)}>
                        <td className="mono">{fmtDate(t.date)}</td>
                        <td><button className="row-btn" onClick={(e) => { e.stopPropagation(); setEdit(t) }}>{t.desc}</button></td>
                        <td className="hide-sm"><span className="cat"><i style={{ background: t.type === 'in' ? 'var(--ink)' : finColor(t.category) }} />{t.category}</span></td>
                        <td className="num mono">{t.type === 'in' ? brl(t.amount) : ''}</td>
                        <td className="num mono">{t.type === 'out' ? brl(t.amount) : ''}</td>
                        <td className={`num mono hide-sm ${running < 0 ? 't-neg' : 'muted'}`}>{brl(running)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                {type === 'all' && (
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Totais</td><td className="hide-sm" />
                      <td className="num mono">{brl(inc)}</td><td className="num mono">{brl(out)}</td><td className="hide-sm" />
                    </tr>
                    <tr className="grand">
                      <td colSpan={2}>Saldo do mês</td><td className="hide-sm" />
                      <td colSpan={2} className="num mono">{brl(inc - out)}</td><td className="hide-sm" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </section>

        <div className="fin-side">
          <section className="cell">
            <header className="cell-head"><h2>Para onde foi</h2><span className="mono small">{brl(out)}</span></header>
            {byCat.length ? <RankBars data={byCat} /> : <p className="muted small">Nenhuma saída registrada.</p>}
          </section>
          <section className="cell">
            <header className="cell-head">
              <h2>Seis meses</h2>
              <div className="legend mono"><span><i style={{ background: 'var(--ink)' }} />Entra</span><span><i style={{ background: 'var(--orange)' }} />Sai</span></div>
            </header>
            <MonthBars data={history} height={160} />
          </section>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Metas de economia</h2>
          <button className="btn" onClick={() => setGoal({})}><Icon name="plus" size={14} /> Meta</button>
        </div>
        {state.goals.length === 0 ? <Empty title="Crie sua primeira meta" /> : (
          <ul className="goals">
            {state.goals.map((g, i) => {
              const pct = g.target ? (g.current / g.target) * 100 : 0
              return (
                <li key={g.id} className="goal">
                  <span className="mono goal-n">{String(i + 1).padStart(2, '0')}</span>
                  <div className="goal-body">
                    <div className="goal-line">
                      <button className="row-btn goal-name" onClick={() => setGoal(g)}>{g.name}</button>
                      <span className="mono">{brl(g.current)} <span className="muted">/ {brl(g.target)}</span></span>
                    </div>
                    <div className="goal-meter"><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
                  </div>
                  <span className="goal-pct">{Math.round(pct)}<small>%</small></span>
                  <button className="btn sm" onClick={() => setDeposit(g)}>+ Aportar</button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar lançamento' : 'Novo lançamento'}
        fields={TX_FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('transactions', edit.id, v) : add('transactions', v))}
        onDelete={edit?.id ? () => remove('transactions', edit.id) : null} />
      <FormModal open={!!goal} onClose={() => setGoal(null)} title={goal?.id ? 'Editar meta' : 'Nova meta'}
        fields={GOAL_FIELDS} initial={goal}
        onSubmit={(v) => (goal?.id ? update('goals', goal.id, v) : add('goals', { current: 0, ...v }))}
        onDelete={goal?.id ? () => remove('goals', goal.id) : null} />
      <FormModal open={!!deposit} onClose={() => setDeposit(null)} title={`Aportar em ${deposit?.name || ''}`} submitLabel="Aportar"
        fields={[{ name: 'amount', label: 'Valor (R$)', type: 'number', step: '0.01', required: true, full: true }]} initial={{}}
        onSubmit={(v) => update('goals', deposit.id, { current: (Number(deposit.current) || 0) + v.amount })} />
    </>
  )
}
