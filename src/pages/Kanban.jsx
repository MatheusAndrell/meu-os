import { useState } from 'react'
import { useStore, uid } from '../store'
import { FormModal, Icon, PageHeader, useNewTrigger } from '../ui'
import { COLUMNS, PRIORITIES, toOptions } from '../constants'
import { daysUntil, fmtDate } from '../utils'

const FIELDS = [
  { name: 'title', label: 'Título', required: true, full: true },
  { name: 'desc', label: 'Descrição', type: 'textarea', full: true },
  { name: 'column', label: 'Coluna', type: 'select', required: true, options: COLUMNS.map((c) => ({ value: c.id, label: c.label })) },
  { name: 'priority', label: 'Prioridade', type: 'select', required: true, options: toOptions(PRIORITIES) },
  { name: 'tag', label: 'Etiqueta', placeholder: 'Trabalho, Estudos…' },
  { name: 'due', label: 'Prazo', type: 'date' },
]

export default function Kanban() {
  const { state, set, update, remove, add } = useStore()
  const [edit, setEdit] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [over, setOver] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [tag, setTag] = useState('')
  useNewTrigger('tarefas', () => setEdit({ column: 'todo', priority: 'media' }))

  const tags = [...new Set(state.tasks.map((t) => t.tag).filter(Boolean))]
  const visible = state.tasks.filter((t) => !tag || t.tag === tag)

  const move = (id, column, beforeId) => {
    if (!id || id === beforeId) return
    const tasks = [...state.tasks]
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx < 0) return
    const [t] = tasks.splice(idx, 1)
    const moved = { ...t, column }
    const bi = beforeId ? tasks.findIndex((x) => x.id === beforeId) : -1
    if (bi >= 0) tasks.splice(bi, 0, moved)
    else tasks.push(moved)
    set('tasks', tasks)
  }
  const endDrag = () => { setDragId(null); setOver(null) }

  const quickAdd = (col) => {
    const title = (drafts[col] || '').trim()
    if (!title) return
    set('tasks', [...state.tasks, { id: uid(), title, column: col, priority: 'media', tag: tag || '', due: '', desc: '' }])
    setDrafts((d) => ({ ...d, [col]: '' }))
  }

  return (
    <>
      <PageHeader n={4} kicker="Tarefas" title="Quadro" accent="de afazeres">
        <button className="btn primary" onClick={() => setEdit({ column: 'todo', priority: 'media', tag })}>
          <Icon name="plus" size={16} /> Tarefa
        </button>
      </PageHeader>

      {tags.length > 0 && (
        <div className="toolbar">
          <div className="chips">
            <button className={`chip ${!tag ? 'on' : ''}`} onClick={() => setTag('')}>Todas</button>
            {tags.map((t) => (
              <button key={t} className={`chip ${tag === t ? 'on' : ''}`} onClick={() => setTag(t)}>#{t}</button>
            ))}
          </div>
          <span className="muted small hide-sm">Arraste os cartões entre colunas</span>
        </div>
      )}

      <div className="board">
        {COLUMNS.map((col, ci) => {
          const items = visible.filter((t) => t.column === col.id)
          return (
            <section key={col.id} className={`col ${over === col.id ? 'over' : ''} col-${col.id}`}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null) }}
              onDrop={(e) => { e.preventDefault(); move(dragId, col.id, null); endDrag() }}>
              <header className="col-head">
                <h2>{col.label}</h2>
                <span className="col-count mono">{items.length}</span>
              </header>
              <div className="col-body">
                {items.map((t) => {
                  const pr = PRIORITIES[t.priority] || PRIORITIES.media
                  const dd = t.due ? daysUntil(t.due) : null
                  return (
                    <article key={t.id} className={`kcard ${dragId === t.id ? 'dragging' : ''}`} draggable
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move'; setDragId(t.id) }}
                      onDragEnd={endDrag}
                      onDragOver={(e) => { e.preventDefault(); setOver(col.id) }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); move(dragId, col.id, t.id); endDrag() }}
                      style={{ '--c': pr.color }}>
                      <button className="kcard-main" onClick={() => setEdit(t)}>
                        <span className={`kcard-title ${col.id === 'done' ? 'striked' : ''}`}>{t.title}</span>
                        {t.desc && <span className="kcard-desc">{t.desc}</span>}
                      </button>
                      <div className="kcard-foot">
                        <span className="prio"><i />{pr.label}</span>
                        {t.tag && <span className="tag mono">#{t.tag}</span>}
                        {t.due && (
                          <span className={`due mono ${dd < 0 && col.id !== 'done' ? 'late' : dd <= 2 && col.id !== 'done' ? 'soon' : ''}`}>
                            {fmtDate(t.due)}
                          </span>
                        )}
                        <span className="spacer" />
                        {ci < COLUMNS.length - 1 && (
                          <button className="icon-btn xs ghost" aria-label={`Mover para ${COLUMNS[ci + 1].label}`} title={`Mover para ${COLUMNS[ci + 1].label}`}
                            onClick={() => update('tasks', t.id, { column: COLUMNS[ci + 1].id })}>
                            <Icon name="arrowR" size={13} />
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
                {items.length === 0 && <div className="col-empty">Solte cartões aqui</div>}
              </div>
              <form className="quick-add" onSubmit={(e) => { e.preventDefault(); quickAdd(col.id) }}>
                <Icon name="plus" size={15} />
                <input value={drafts[col.id] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [col.id]: e.target.value }))}
                  placeholder="Adicionar rápido…" aria-label={`Adicionar tarefa em ${col.label}`} />
              </form>
            </section>
          )
        })}
      </div>

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar tarefa' : 'Nova tarefa'}
        fields={FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('tasks', edit.id, v) : add('tasks', v))}
        onDelete={edit?.id ? () => remove('tasks', edit.id) : null} />
    </>
  )
}
