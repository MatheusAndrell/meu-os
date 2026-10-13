import { useState } from 'react'
import { useStore } from '../store'
import { Chips, Empty, FormModal, Icon, Levels, PageHeader, Pill, useNewTrigger } from '../ui'
import { LEVELS, SKILL_CATEGORIES, SKILL_STATUS, catColor, toOptions } from '../constants'
import { avg, norm } from '../utils'

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
  useNewTrigger('stack', () => setEdit({ category: 'Backend', status: 'estudando', level: 1 }))

  const skills = state.skills.filter((s) => (cat === 'Todas' || s.category === cat) && norm(s.name).includes(norm(q)))
  const dist = [1, 2, 3, 4, 5].map((l) => state.skills.filter((s) => s.level === l).length)
  const total = state.skills.length || 1
  const groups = SKILL_CATEGORIES.map((c) => ({ ...c, items: skills.filter((s) => s.category === c.id) })).filter((g) => g.items.length)

  return (
    <>
      <PageHeader n={2} kicker="Tecnologias" title="Minha stack" accent="& níveis">
        <button className="btn primary" onClick={() => setEdit({ category: 'Backend', status: 'estudando', level: 1 })}>
          <Icon name="plus" size={16} /> Tecnologia
        </button>
      </PageHeader>

      <section className="card level-dist">
        <div className="dist-bar" role="img" aria-label={dist.map((d, i) => `${LEVELS[i + 1]}: ${d}`).join(', ')}>
          {dist.map((d, i) => d > 0 && (
            <span key={i} style={{ flex: d, opacity: 0.35 + i * 0.16 }} title={`${LEVELS[i + 1]}: ${d}`} />
          ))}
        </div>
        <div className="dist-legend">
          {dist.map((d, i) => (
            <div key={i}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <strong>{d}</strong>
              <small>{LEVELS[i + 1]} · {Math.round((d / total) * 100)}%</small>
            </div>
          ))}
        </div>
      </section>

      <div className="toolbar">
        <Chips value={cat} onChange={setCat}
          options={[{ value: 'Todas', label: 'Todas', count: state.skills.length },
            ...SKILL_CATEGORIES.map((c) => ({ value: c.id, label: c.id, color: c.color, count: state.skills.filter((s) => s.category === c.id).length }))]} />
        <div className="search">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar…" aria-label="Filtrar tecnologias" />
        </div>
      </div>

      {groups.length === 0 && <Empty title="Nenhuma tecnologia encontrada">Ajuste o filtro ou adicione uma nova.</Empty>}

      {groups.map((g) => (
        <section key={g.id} className="skill-group">
          <div className="group-head">
            <h2><i style={{ background: g.color }} />{g.id}</h2>
            <span className="mono muted small">média {avg(g.items.map((s) => s.level)).toFixed(1).replace('.', ',')} · {g.items.length} itens</span>
          </div>
          <div className="skill-grid">
            {g.items.map((s) => (
              <article key={s.id} className="card skill" style={{ '--c': catColor(s.category) }}>
                <div className="skill-top">
                  <h3>{s.name}</h3>
                  <button className="icon-btn sm ghost" onClick={() => setEdit(s)} aria-label={`Editar ${s.name}`}>
                    <Icon name="edit" size={15} />
                  </button>
                </div>
                <Levels value={s.level} color={catColor(s.category)} onSet={(level) => update('skills', s.id, { level })} />
                <div className="skill-meta">
                  <span className="mono small">{s.level}/5 · {LEVELS[s.level]}</span>
                  <Pill color={SKILL_STATUS[s.status]?.color}>{SKILL_STATUS[s.status]?.label}</Pill>
                </div>
                {s.goal && <p className="skill-goal"><Icon name="target" size={13} /> {s.goal}</p>}
              </article>
            ))}
          </div>
        </section>
      ))}

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar tecnologia' : 'Nova tecnologia'}
        fields={FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('skills', edit.id, v) : add('skills', v))}
        onDelete={edit?.id ? () => remove('skills', edit.id) : null} />
    </>
  )
}
