import { useState } from 'react'
import { useStore } from '../store'
import { Chips, Empty, FormModal, Icon, PageHeader, Pill, useNewTrigger } from '../ui'
import { CERT_STATUS, toOptions } from '../constants'
import { brl, daysUntil, fmtDateLong, relDays } from '../utils'

const FIELDS = [
  { name: 'name', label: 'Certificação', required: true, full: true },
  { name: 'provider', label: 'Emissor', placeholder: 'AWS, Oracle, GitHub…' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: toOptions(CERT_STATUS) },
  { name: 'progress', label: 'Preparação', type: 'range', suffix: '%', full: true },
  { name: 'targetDate', label: 'Data da prova', type: 'date' },
  { name: 'cost', label: 'Custo (R$)', type: 'number', step: '0.01', min: 0 },
  { name: 'link', label: 'Link oficial', type: 'url', full: true, placeholder: 'https://' },
  { name: 'notes', label: 'Plano de estudo / anotações', type: 'textarea', full: true },
]

const ORDER = { agendada: 0, estudando: 1, planejada: 2, concluida: 3 }

export default function Certs() {
  const { state, add, update, remove } = useStore()
  const [filter, setFilter] = useState('todas')
  const [edit, setEdit] = useState(null)
  const blank = { status: 'planejada', progress: 0 }
  useNewTrigger('certificacoes', () => setEdit(blank))

  const certs = state.certs
    .filter((c) => filter === 'todas' || c.status === filter)
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || (a.targetDate || '9').localeCompare(b.targetDate || '9'))
  const count = (s) => state.certs.filter((c) => c.status === s).length
  const investment = state.certs.reduce((a, c) => a + (Number(c.cost) || 0), 0)

  return (
    <>
      <PageHeader n={3} kicker="Certificações" title="Credenciais" accent="em construção">
        <button className="btn primary" onClick={() => setEdit(blank)}><Icon name="plus" size={16} /> Certificação</button>
      </PageHeader>

      <div className="kpis">
        {Object.entries(CERT_STATUS).map(([k, v]) => (
          <div key={k} className="card kpi" style={{ '--c': v.color }}>
            <span className="stat-label"><i className="dot" style={{ background: v.color }} />{v.label}</span>
            <span className="stat-value">{count(k)}</span>
          </div>
        ))}
        {investment > 0 && (
          <div className="card kpi">
            <span className="stat-label">Investimento</span>
            <span className="stat-value sm">{brl(investment)}</span>
          </div>
        )}
      </div>

      <div className="toolbar">
        <Chips value={filter} onChange={setFilter}
          options={[{ value: 'todas', label: 'Todas', count: state.certs.length }, ...Object.entries(CERT_STATUS).map(([value, v]) => ({ value, label: v.label, color: v.color, count: count(value) }))]} />
      </div>

      {certs.length === 0 && <Empty icon="award" title="Nenhuma certificação aqui">Adicione a próxima credencial que você quer conquistar.</Empty>}

      <div className="cert-grid">
        {certs.map((c) => {
          const days = c.targetDate ? daysUntil(c.targetDate) : null
          const st = CERT_STATUS[c.status] || CERT_STATUS.planejada
          const done = c.status === 'concluida'
          return (
            <article key={c.id} className={`card cert ${done ? 'done' : ''}`} style={{ '--c': st.color }}>
              <div className="cert-top">
                <span className="provider mono">{c.provider || '—'}</span>
                <Pill color={st.color}>{st.label}</Pill>
              </div>
              <h3 className="cert-name">{c.name}</h3>
              <div className="cert-progress">
                <input type="range" min="0" max="100" step="5" value={c.progress || 0} aria-label={`Preparação de ${c.name}`}
                  style={{ '--p': `${c.progress || 0}%` }}
                  onChange={(e) => update('certs', c.id, { progress: Number(e.target.value) })} />
                <span className="mono">{c.progress || 0}%</span>
              </div>
              <div className="cert-foot">
                <span className={`mono small ${days != null && days < 0 && !done ? 't-coral' : 'muted'}`}>
                  <Icon name="calendar" size={14} />
                  {c.targetDate ? `${fmtDateLong(c.targetDate)} · ${done ? 'concluída' : relDays(days)}` : 'sem data definida'}
                </span>
                <div className="row gap-4">
                  {c.link && (
                    <a className="icon-btn sm ghost" href={c.link} target="_blank" rel="noopener noreferrer" aria-label="Abrir link oficial">
                      <Icon name="external" size={15} />
                    </a>
                  )}
                  {!done && (
                    <button className="icon-btn sm ghost" title="Marcar como concluída" aria-label="Marcar como concluída"
                      onClick={() => update('certs', c.id, { status: 'concluida', progress: 100 })}>
                      <Icon name="check" size={15} />
                    </button>
                  )}
                  <button className="icon-btn sm ghost" onClick={() => setEdit(c)} aria-label={`Editar ${c.name}`}>
                    <Icon name="edit" size={15} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar certificação' : 'Nova certificação'}
        fields={FIELDS} initial={edit}
        onSubmit={(v) => (edit?.id ? update('certs', edit.id, v) : add('certs', v))}
        onDelete={edit?.id ? () => remove('certs', edit.id) : null} />
    </>
  )
}
