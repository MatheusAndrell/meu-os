import { useState } from 'react'
import { useStore } from '../store'
import { Empty, FormModal, Icon, PageHeader } from '../ui'
import { addDays, iso } from '../utils'

const DAYS = 21

function streak(log = {}) {
  let n = 0
  let d = new Date()
  if (!log[iso(d)]) d = addDays(d, -1)
  while (log[iso(d)]) { n++; d = addDays(d, -1) }
  return n
}

export default function Habits() {
  const { state, add, update, remove } = useStore()
  const [edit, setEdit] = useState(null)
  const today = new Date()
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i - DAYS + 1))
  const toggle = (h, key) => update('habits', h.id, { log: { ...h.log, [key]: !h.log?.[key] } })

  const totalCells = state.habits.length * DAYS
  const doneCells = state.habits.reduce((a, h) => a + days.filter((d) => h.log?.[iso(d)]).length, 0)

  return (
    <>
      <PageHeader n={7} title="Constância" meta={`últimos ${DAYS} dias`}>
        <button className="btn primary" onClick={() => setEdit({})}><Icon name="plus" size={16} /> Hábito</button>
      </PageHeader>

      <div className="cells c3">
        <div className="cell stat"><span className="cell-label mono">Conclusão · {DAYS} dias</span><span className="stat-num">{totalCells ? Math.round((doneCells / totalCells) * 100) : 0}<small>%</small></span></div>
        <div className="cell stat"><span className="cell-label mono">Melhor sequência atual</span><span className="stat-num">{Math.max(0, ...state.habits.map((h) => streak(h.log)))}<small> dias</small></span></div>
        <div className="cell stat"><span className="cell-label mono">Hoje</span><span className="stat-num">{state.habits.filter((h) => h.log?.[iso(today)]).length}<small>/{state.habits.length}</small></span></div>
      </div>

      {state.habits.length === 0 ? <Empty title="Nenhum hábito ainda">Comece com algo pequeno, como 10 minutos de leitura.</Empty> : (
        <section className="punch">
          <table className="habit-table">
            <thead>
              <tr>
                <th className="h-name">Hábito</th>
                {days.map((d) => (
                  <th key={iso(d)} className={iso(d) === iso(today) ? 'today' : ''}>
                    <span className="mono">{d.toLocaleDateString('pt-BR', { weekday: 'narrow' })}</span>
                    <b className="mono">{d.getDate()}</b>
                  </th>
                ))}
                <th className="h-streak mono">Seq.</th>
              </tr>
            </thead>
            <tbody>
              {state.habits.map((h) => {
                const s = streak(h.log)
                return (
                  <tr key={h.id}>
                    <td className="h-name">
                      <button className="link-plain" onClick={() => setEdit(h)}>{h.name}</button>
                    </td>
                    {days.map((d) => {
                      const k = iso(d)
                      const on = !!h.log?.[k]
                      return (
                        <td key={k}>
                          <button className={`hole ${on ? 'on' : ''} ${k === iso(today) ? 'today' : ''}`} onClick={() => toggle(h, k)}
                            aria-pressed={on} aria-label={`${h.name} em ${d.toLocaleDateString('pt-BR')}`} />
                        </td>
                      )
                    })}
                    <td className="h-streak mono">
                      <span className={s >= 3 ? 'hot' : ''}>{String(s).padStart(2, '0')}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar hábito' : 'Novo hábito'}
        fields={[{ name: 'name', label: 'Hábito', required: true, full: true, placeholder: 'Ex.: Inglês 15 min' }]} initial={edit}
        onSubmit={(v) => (edit?.id ? update('habits', edit.id, v) : add('habits', { log: {}, ...v }))}
        onDelete={edit?.id ? () => remove('habits', edit.id) : null} />
    </>
  )
}
