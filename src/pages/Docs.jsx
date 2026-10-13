import { useState } from 'react'
import { useStore } from '../store'
import { Chips, Empty, FormModal, Icon, PageHeader, Pill, useNewTrigger } from '../ui'
import { DOC_CATEGORIES, docColor } from '../constants'
import { hostOf, norm } from '../utils'

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
      <PageHeader n={6} kicker="Documentos" title="Arquivo" accent="importante">
        <button className="btn primary" onClick={() => setEdit({ category: 'Estudos' })}><Icon name="plus" size={16} /> Documento</button>
      </PageHeader>

      <div className="toolbar">
        <Chips value={cat} onChange={setCat}
          options={['Todas', ...DOC_CATEGORIES].map((c) => ({ value: c, label: c, color: c === 'Todas' ? null : docColor(c), count: c === 'Todas' ? state.docs.length : state.docs.filter((d) => d.category === c).length }))} />
        <div className="search">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar em títulos e notas…" aria-label="Buscar documentos" />
        </div>
      </div>

      <p className="notice small"><Icon name="sparkle" size={14} /> Use para links e lembretes. Evite guardar senhas ou números de documentos — os dados ficam no navegador, sem criptografia.</p>

      {docs.length === 0 && <Empty icon="file" title="Nada por aqui">Adicione links de documentação, contratos, lembretes…</Empty>}

      <div className="doc-grid">
        {docs.map((d) => (
          <article key={d.id} className={`card doc ${d.pinned ? 'pinned' : ''}`}>
            <div className="row between">
              <Pill color={docColor(d.category)}>{d.category}</Pill>
              <div className="row gap-4">
                <button className={`icon-btn sm ghost ${d.pinned ? 'on' : ''}`} onClick={() => update('docs', d.id, { pinned: !d.pinned })}
                  aria-pressed={!!d.pinned} aria-label={d.pinned ? 'Desafixar' : 'Fixar no início'}>
                  <Icon name="pin" size={15} />
                </button>
                <button className="icon-btn sm ghost" onClick={() => setEdit(d)} aria-label={`Editar ${d.title}`}><Icon name="edit" size={15} /></button>
              </div>
            </div>
            <h3>{d.title}</h3>
            {d.note && <p className="muted small">{d.note}</p>}
            {d.url && (
              <a className="doc-link mono" href={d.url} target="_blank" rel="noopener noreferrer">
                {hostOf(d.url)} <Icon name="external" size={13} />
              </a>
            )}
          </article>
        ))}
      </div>

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar documento' : 'Novo documento'}
        fields={FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('docs', edit.id, v) : add('docs', { pinned: false, ...v }))}
        onDelete={edit?.id ? () => remove('docs', edit.id) : null} />
    </>
  )
}
