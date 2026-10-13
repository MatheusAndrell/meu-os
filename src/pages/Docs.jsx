import { useState } from 'react'
import { useStore } from '../store'
import { Chips, Empty, FormModal, Icon, PageHeader, Pill, useNewTrigger } from '../ui'
import { DOC_CATEGORIES, docColor } from '../constants'
import { hostOf, norm, pad } from '../utils'

const FIELDS = [
  { name: 'title', label: 'Título', required: true, full: true },
  { name: 'category', label: 'Categoria', type: 'select', required: true, options: DOC_CATEGORIES },
  { name: 'url', label: 'Link (opcional)', type: 'url', placeholder: 'https://' },
  { name: 'note', label: 'Anotação', type: 'textarea', full: true },
]

export default function Docs() {
  const { state, add, update, remove } = useStore()
  const [cat, setCat] = useState('Todas')
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  useNewTrigger('documentos', () => setEdit({ category: 'Estudos' }))

  const docs = state.docs
    .filter((d) => (cat === 'Todas' || d.category === cat) && norm(`${d.title} ${d.note} ${d.url}`).includes(norm(q)))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))

  return (
    <>
      <PageHeader n={6} title="Arquivo" meta={`${state.docs.length} fichas · ${state.docs.filter((d) => d.pinned).length} fixadas`}>
        <button className="btn primary" onClick={() => setEdit({ category: 'Estudos' })}><Icon name="plus" size={16} /> Ficha</button>
      </PageHeader>

      <div className="toolbar">
        <Chips value={cat} onChange={setCat}
          options={['Todas', ...DOC_CATEGORIES].map((c) => ({ value: c, label: c, color: c === 'Todas' ? null : docColor(c), count: c === 'Todas' ? state.docs.length : state.docs.filter((d) => d.category === c).length }))} />
        <div className="search">
          <Icon name="search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar documentos" />
        </div>
      </div>

      <p className="notice mono">Nota — use para links e lembretes. Não guarde senhas nem números de documentos: os dados ficam no navegador, sem criptografia.</p>

      {docs.length === 0 ? <Empty title="Nada por aqui">Adicione links de documentação, contratos, lembretes…</Empty> : (
        <ul className="catalog">
          {docs.map((d, i) => (
            <li key={d.id} className={`card-row ${d.pinned ? 'pinned' : ''}`}>
              <span className="mono cat-code">{pad(i + 1)}</span>
              <div className="cat-main">
                <button className="row-btn cat-title" onClick={() => setEdit(d)}>{d.title}</button>
                {d.note && <p className="muted">{d.note}</p>}
              </div>
              <span className="cat-tag"><Pill color={docColor(d.category)}>{d.category}</Pill></span>
              <span className="cat-link">
                {d.url ? <a className="mono" href={d.url} target="_blank" rel="noopener noreferrer">{hostOf(d.url)} ↗</a> : <span className="mono muted">sem link</span>}
              </span>
              <span className="cat-actions">
                <button className={`icon-btn ${d.pinned ? 'on' : ''}`} onClick={() => update('docs', d.id, { pinned: !d.pinned })}
                  aria-pressed={!!d.pinned} aria-label={d.pinned ? 'Desafixar' : 'Fixar no início'} title={d.pinned ? 'Desafixar' : 'Fixar no início'}>
                  <Icon name="pin" size={14} />
                </button>
                <button className="icon-btn" onClick={() => setEdit(d)} aria-label={`Editar ${d.title}`}><Icon name="edit" size={14} /></button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar ficha' : 'Nova ficha'}
        fields={FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('docs', edit.id, v) : add('docs', { pinned: false, ...v }))}
        onDelete={edit?.id ? () => remove('docs', edit.id) : null} />
    </>
  )
}
