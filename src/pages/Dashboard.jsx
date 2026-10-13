import { useStore } from '../store'
import { Icon, Progress, Pill, useClock } from '../ui'
import { Radar, MonthBars } from '../charts'
import { SKILL_CATEGORIES, PRIORITIES, CERT_STATUS } from '../constants'
import { addMonths, avg, brl, daysUntil, fmtDate, fmtDateLong, hostOf, iso, monthKey, monthShort, pad, sum } from '../utils'

export default function Dashboard({ go }) {
  const { state, set, update } = useStore()
  const now = useClock()
  const today = iso(now)
  const { settings, skills, certs, tasks, transactions, habits, docs } = state

  const h = now.getHours()
  const greet = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')

  const mk = monthKey(now)
  const monthTx = transactions.filter((t) => t.date?.startsWith(mk))
  const inc = sum(monthTx.filter((t) => t.type === 'in').map((t) => t.amount))
  const out = sum(monthTx.filter((t) => t.type === 'out').map((t) => t.amount))

  const doing = tasks.filter((t) => t.column === 'doing')
  const openTasks = tasks.filter((t) => t.column !== 'done')
  const doneCerts = certs.filter((c) => c.status === 'concluida').length
  const next = certs
    .filter((c) => c.status !== 'concluida' && c.targetDate && daysUntil(c.targetDate) >= 0)
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))[0]

  const radar = SKILL_CATEGORIES.map((c) => ({
    label: c.id,
    color: c.color,
    value: avg(skills.filter((s) => s.category === c.id).map((s) => s.level)) / 5,
  }))
  const avgLevel = avg(skills.map((s) => s.level))
  const months = Array.from({ length: 6 }, (_, i) => addMonths(now, i - 5)).map((d) => {
    const tx = transactions.filter((t) => t.date?.startsWith(monthKey(d)))
    return {
      label: monthShort(d),
      in: sum(tx.filter((t) => t.type === 'in').map((t) => t.amount)),
      out: sum(tx.filter((t) => t.type === 'out').map((t) => t.amount)),
    }
  })
  const pinned = docs.filter((d) => d.pinned).slice(0, 5)
  const habitsDone = habits.filter((x) => x.log?.[today]).length
  const toggleHabit = (x) => update('habits', x.id, { log: { ...x.log, [today]: !x.log?.[today] } })

  return (
    <div className="bento">
      <section className="card hero span-12">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-left">
          <div className="kicker mono"><span className="kicker-num">01</span> / {weekday} · {dateStr}</div>
          <h1 className="hero-title">
            {greet},<br /><em>{settings.name || 'você'}.</em>
          </h1>
        </div>
        <div className="hero-right">
          <div className="clock mono" aria-label="Hora atual">
            {pad(now.getHours())}<span className="blink">:</span>{pad(now.getMinutes())}
          </div>
          <label className="focus">
            <span className="field-label">Foco de hoje</span>
            <input value={settings.focus || ''} placeholder="Qual é a única coisa que importa hoje?"
              onChange={(e) => set('settings', { ...settings, focus: e.target.value })} />
          </label>
          <div className="hero-meta mono">
            <span>{openTasks.length} tarefas abertas</span>
            <span>{habits.length - habitsDone} hábitos pendentes</span>
            {next && <span>prova em {daysUntil(next.targetDate)}d</span>}
          </div>
        </div>
      </section>

      <button className="card stat span-3" onClick={() => go('financas')}>
        <span className="stat-label">Saldo do mês</span>
        <span className={`stat-value ${inc - out < 0 ? 'neg' : ''}`}>{brl(inc - out)}</span>
        <span className="stat-sub"><b className="t-mint">↑ {brl(inc)}</b> <b className="t-coral">↓ {brl(out)}</b></span>
      </button>
      <button className="card stat span-3" onClick={() => go('tarefas')}>
        <span className="stat-label">Tarefas abertas</span>
        <span className="stat-value">{openTasks.length}</span>
        <span className="stat-sub">{doing.length} em andamento · {tasks.filter((t) => t.column === 'done').length} feitas</span>
      </button>
      <button className="card stat span-3" onClick={() => go('certificacoes')}>
        <span className="stat-label">Certificações</span>
        <span className="stat-value">{doneCerts}<small>/{certs.length}</small></span>
        <Progress value={certs.length ? (doneCerts / certs.length) * 100 : 0} />
      </button>
      <button className="card stat span-3" onClick={() => go('stack')}>
        <span className="stat-label">Nível médio da stack</span>
        <span className="stat-value">{avgLevel.toFixed(1).replace('.', ',')}<small>/5</small></span>
        <span className="stat-sub">{skills.length} tecnologias mapeadas</span>
      </button>

      <section className="card span-5">
        <div className="card-head">
          <h2>Mapa de habilidades</h2>
          <button className="link" onClick={() => go('stack')}>Ver stack <Icon name="arrowR" size={14} /></button>
        </div>
        <div className="radar-wrap"><Radar data={radar} /></div>
      </section>

      <section className="card span-4">
        <div className="card-head">
          <h2>Em andamento</h2>
          <button className="link" onClick={() => go('tarefas')}>Kanban <Icon name="arrowR" size={14} /></button>
        </div>
        {doing.length === 0 ? <p className="muted">Nada em andamento. Puxe algo de “A fazer”.</p> : (
          <ul className="mini-list">
            {doing.map((t) => (
              <li key={t.id}>
                <i className="dot" style={{ background: PRIORITIES[t.priority]?.color }} />
                <span className="grow">{t.title}</span>
                {t.due && <span className="mono muted small">{fmtDate(t.due)}</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="divider" />
        <div className="card-head"><h3>A seguir</h3></div>
        <ul className="mini-list">
          {tasks.filter((t) => t.column === 'todo').slice(0, 3).map((t) => (
            <li key={t.id}>
              <i className="dot hollow" />
              <span className="grow muted">{t.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card span-3 countdown">
        <div className="card-head"><h2>Próxima prova</h2></div>
        {next ? (
          <>
            <div className="count-num">{daysUntil(next.targetDate)}<span>dias</span></div>
            <div className="count-name">{next.name}</div>
            <div className="row between small muted mono">
              <span>{fmtDateLong(next.targetDate)}</span>
              <Pill color={CERT_STATUS[next.status]?.color}>{CERT_STATUS[next.status]?.label}</Pill>
            </div>
            <Progress value={next.progress} />
            <span className="small muted mono">{next.progress}% preparado</span>
          </>
        ) : (
          <p className="muted">Nenhuma prova com data. <button className="link" onClick={() => go('certificacoes')}>Planejar</button></p>
        )}
      </section>

      <section className="card span-5">
        <div className="card-head">
          <h2>Fluxo de caixa</h2>
          <div className="legend small"><span><i style={{ background: 'var(--mint)' }} />Entradas</span><span><i style={{ background: 'var(--coral)' }} />Saídas</span></div>
        </div>
        <MonthBars data={months} />
      </section>

      <section className="card span-4">
        <div className="card-head">
          <h2>Hábitos de hoje</h2>
          <span className="mono small muted">{habitsDone}/{habits.length}</span>
        </div>
        <ul className="habit-today">
          {habits.map((x) => (
            <li key={x.id}>
              <button className={`check ${x.log?.[today] ? 'on' : ''}`} onClick={() => toggleHabit(x)} aria-pressed={!!x.log?.[today]}>
                <span className="box"><Icon name="check" size={14} /></span>
                <span>{x.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card span-3">
        <div className="card-head">
          <h2>Fixados</h2>
          <button className="link" onClick={() => go('documentos')}>Todos <Icon name="arrowR" size={14} /></button>
        </div>
        <ul className="pins">
          {pinned.length === 0 && <li className="muted small">Fixe documentos para acessá-los aqui.</li>}
          {pinned.map((d) => (
            <li key={d.id}>
              {d.url ? (
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  <span className="grow">{d.title}<small className="mono">{hostOf(d.url)}</small></span>
                  <Icon name="external" size={14} />
                </a>
              ) : (
                <button onClick={() => go('documentos')}>
                  <span className="grow">{d.title}<small className="mono">{d.category}</small></span>
                  <Icon name="arrowR" size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
