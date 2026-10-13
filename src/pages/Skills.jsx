import { useState } from 'react'
import { useStore } from '../store'
import { Chips, Empty, FormModal, Icon, Levels, PageHeader, Pill, useNewTrigger } from '../ui'
import { LEVELS, SKILL_CATEGORIES, SKILL_STATUS, catColor, toOptions } from '../constants'
import { avg, norm, pad } from '../utils'

const FIELDS = [
  { name: 'name', label: 'Tecnologia', required: true, full: true },
  { name: 'category', label: 'Área', type: 'select', required: true, options: SKILL_CATEGORIES.map((c) => c.id) },
  { name: 'status', label: 'Status', type: 'select', required: true, options: toOptions(SKILL_STATUS) },
  { name: 'level', label: 'Nível', type: 'level', full: true },
  { name: 'goal', label: 'Próximo passo', full: true, placeholder: 'Ex.: estudar filas e jobs' },
  { name: 'notes', label: 'Anotações', type: 'textarea', full: true },
]

export default function Skills() {
  const { state, add, update, remove } = useStore()
  const [cat, setCat] = useState('Todas')
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const blank = { category: 'Backend', status: 'estudando', level: 1 }
  useNewTrigger('stack', () => setEdit(blank))

  const skills = state.skills.filter((s) => (cat === 'Todas' || s.category === cat) && norm(s.name).includes(norm(q)))
  const dist = [1, 2, 3, 4, 5].map((l) => state.skills.filter((s) => s.level === l).length)
  const total = state.skills.length || 1
  const groups = SKILL_CATEGORIES.map((c) => ({ ...c, items: skills.filter((s) => s.category === c.id) })).filter((g) => g.items.length)
  let row = 0

  return (
    <>
      <PageHeader n={2} title="Stack" meta={`${state.skills.length} tecnologias · média ${avg(state.skills.map((s) => s.level)).toFixed(1).replace('.', ',')}`}>
        <button className="btn primary" onClick={() => setEdit(blank)}><Icon name="plus" size={16} /> Tecnologia</button>
      </PageHeader>

      <div className="dist" role="img" aria-label={dist.map((d, i) => `${LEVELS[i + 1]}: ${d}`).join(', ')}>
        {dist.map((d, i) => (
          <div key={i} className="dist-col" style={{ flexGrow: Math.max(d, 0.6) }} data-l={i + 1}>
            <span className="mono">{pad(i + 1)} · {LEVELS[i + 1]}</span>
            <strong>{d}</strong>
            <span className="mono">{Math.round((d / total) * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <Chips value={cat} onChange={setCat}
          options={[{ value: 'Todas', label: 'Todas', count: state.skills.length },
            ...SKILL_CATEGORIES.map((c) => ({ value: c.id, label: c.id, color: c.color, count: state.skills.filter((s) => s.category === c.id).length }))]} />
        <div className="search">
          <Icon name="search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar" aria-label="Filtrar tecnologias" />
        </div>
      </div>

      {groups.length === 0 && <Empty title="Nenhuma tecnologia encontrada">Ajuste o filtro ou adicione uma nova.</Empty>}

      {groups.length > 0 && (
        <div className="sheet">
          <div className="sheet-row sheet-th mono" aria-hidden="true">
            <span>Nº</span><span>Tecnologia</span><span>Nível</span><span>Status</span><span>Próximo passo</span><span />
          </div>
          {groups.map((g) => (
            <div key={g.id} className="sheet-group">
              <div className="sheet-gh">
                <span className="swatch" style={{ background: g.color }} />
                <h2>{g.id}</h2>
                <span className="mono">{g.code} · {pad(g.items.length)} · média {avg(g.items.map((s) => s.level)).toFixed(1).replace('.', ',')}</span>
              </div>
              {g.items.map((s) => {
                row++
                return (
                  <div key={s.id} className="sheet-row">
                    <span className="mono muted">{pad(row)}</span>
                    <button className="sheet-name" onClick={() => setEdit(s)}>{s.name}</button>
                    <span className="sheet-level">
                      <Levels value={s.level} color={catColor(s.category)} onSet={(level) => update('skills', s.id, { level })} />
                      <span className="mono small">{s.level}/5 {LEVELS[s.level]}</span>
                    </span>
                    <span><Pill color={SKILL_STATUS[s.status]?.color}>{SKILL_STATUS[s.status]?.label}</Pill></span>
                    <span className="sheet-goal muted">{s.goal || '—'}</span>
                    <button className="icon-btn" onClick={() => setEdit(s)} aria-label={`Editar ${s.name}`}><Icon name="edit" size={14} /></button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar tecnologia' : 'Nova tecnologia'}
        fields={FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('skills', edit.id, v) : add('skills', v))}
        onDelete={edit?.id ? () => remove('skills', edit.id) : null} />
    </>
  )
}
