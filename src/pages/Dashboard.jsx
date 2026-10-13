import { useStore } from '../store'
import { Icon, Ticks, Progress, useClock } from '../ui'
import { MonthBars } from '../charts'
import { SKILL_CATEGORIES, PRIORITIES, CERT_STATUS } from '../constants'
import { addMonths, avg, brl, brlShort, daysUntil, fmtDate, fmtDateLong, hostOf, iso, monthKey, monthShort, pad, sum } from '../utils'

function Ticker({ items }) {
  const row = items.map((t, i) => (
    <span key={i} className="ticker-item">{t}<i aria-hidden="true">■</i></span>
  ))
  return (
    <div className="ticker" aria-label={items.join(' · ')}>
      <div className="ticker-track" aria-hidden="true">
        <div>{row}</div>
        <div>{row}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ go }) {
  const { state, set, update } = useStore()
  const now = useClock()
  const today = iso(now)
  const { settings, skills, certs, tasks, transactions, habits, docs } = state

  const h = now.getHours()
  const greet = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const longDate = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const mk = monthKey(now)
  const monthTx = transactions.filter((t) => t.date?.startsWith(mk))
  const inc = sum(monthTx.filter((t) => t.type === 'in').map((t) => t.amount))
  const out = sum(monthTx.filter((t) => t.type === 'out').map((t) => t.amount))

  const doing = tasks.filter((t) => t.column === 'doing')
  const todo = tasks.filter((t) => t.column === 'todo')
  const openTasks = tasks.filter((t) => t.column !== 'done')
  const doneCerts = certs.filter((c) => c.status === 'concluida').length
  const next = certs
    .filter((c) => c.status !== 'concluida' && c.targetDate && daysUntil(c.targetDate) >= 0)
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))[0]
  const avgLevel = avg(skills.map((s) => s.level))
  const cats = SKILL_CATEGORIES.map((c) => {
    const list = skills.filter((s) => s.category === c.id)
    return { ...c, n: list.length, value: avg(list.map((s) => s.level)) }
  })
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
  const studying = skills.filter((s) => s.status === 'estudando').map((s) => s.name)

  const ticker = [
    `Saldo do mês ${brlShort(inc - out)}`,
    `${openTasks.length} tarefas abertas`,
    `${doing.length} em andamento`,
    next ? `${next.name} em ${daysUntil(next.targetDate)} dias` : 'Nenhuma prova agendada',
    `Hábitos hoje ${habitsDone}/${habits.length}`,
    `Stack média ${avgLevel.toFixed(1).replace('.', ',')}/5`,
    studying.length ? `Estudando: ${studying.slice(0, 4).join(', ')}` : 'Escolha algo para estudar',
  ]

  return (
    <>
      <section className="lead">
        <div className="lead-main">
          <div className="lead-kicker mono">
            <span>§01</span>
            <span className="cap">{longDate}</span>
          </div>
          <h1 className="headline">
            <span>{greet},</span>
            <span className="hl-name" style={{ '--len': Math.max(5, (settings.name || 'você').length + 1) }}>{settings.name || 'você'}<b>.</b></span>
          </h1>
        </div>
        <aside className="lead-side">
          <div className="bigclock" aria-label="Hora atual">
            {pad(now.getHours())}<span className="blink">:</span>{pad(now.getMinutes())}
          </div>
          <label className="focus-line">
            <span className="mono">Foco de hoje</span>
            <input value={settings.focus || ''} placeholder="escreva aqui a única coisa que importa"
              onChange={(e) => set('settings', { ...settings, focus: e.target.value })} />
          </label>
        </aside>
      </section>

      <Ticker items={ticker} />

      <div className="cells c4">
        <button className="cell stat wide-sm" onClick={() => go('financas')}>
          <span className="cell-label mono">A · Saldo do mês</span>
          <span className={`stat-num ${inc - out < 0 ? 'neg' : ''}`}>{brl(inc - out)}</span>
          <span className="stat-sub mono">+{brlShort(inc)} / −{brlShort(out)}</span>
        </button>
        <button className="cell stat" onClick={() => go('tarefas')}>
          <span className="cell-label mono">B · Tarefas abertas</span>
          <span className="stat-num">{pad(openTasks.length)}</span>
          <span className="stat-sub mono">{doing.length} fazendo · {tasks.length - openTasks.length} feitas</span>
        </button>
        <button className="cell stat" onClick={() => go('certificacoes')}>
          <span className="cell-label mono">C · Certificações</span>
          <span className="stat-num">{pad(doneCerts)}<small>/{pad(certs.length)}</small></span>
          <Progress value={certs.length ? (doneCerts / certs.length) * 100 : 0} />
        </button>
        <button className="cell stat" onClick={() => go('stack')}>
          <span className="cell-label mono">D · Nível médio</span>
          <span className="stat-num">{avgLevel.toFixed(1).replace('.', ',')}<small>/5</small></span>
          <span className="stat-sub mono">{skills.length} tecnologias</span>
        </button>
      </div>

      <div className="cells dash-a">
        <section className="cell">
          <header className="cell-head">
            <h2>Habilidades por área</h2>
            <button className="cell-link mono" onClick={() => go('stack')}>Stack →</button>
          </header>
          <ul className="area-list">
            {cats.map((c) => (
              <li key={c.id}>
                <span className="area-code mono" style={{ '--c': c.color }}>{c.code}</span>
                <span className="area-name">{c.id}<small className="mono">{c.n} itens</small></span>
                <Ticks value={c.value / 5} color={c.color} />
                <span className="area-val mono">{c.value.toFixed(1).replace('.', ',')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="cell">
          <header className="cell-head">
            <h2>Em andamento</h2>
            <button className="cell-link mono" onClick={() => go('tarefas')}>Quadro →</button>
          </header>
          {doing.length === 0 ? <p className="muted">Nada em andamento. Puxe algo de “A fazer”.</p> : (
            <ol className="numbered">
              {doing.map((t, i) => (
                <li key={t.id}>
                  <span className="mono num">{pad(i + 1)}</span>
                  <span className="grow">{t.title}</span>
                  <span className="prio-mini" data-level={PRIORITIES[t.priority]?.level || 2} aria-label={`Prioridade ${PRIORITIES[t.priority]?.label}`} />
                </li>
              ))}
            </ol>
          )}
          <div className="sub-head mono">Na fila</div>
          <ol className="numbered quiet">
            {todo.slice(0, 3).map((t) => (
              <li key={t.id}>
                <span className="mono num">—</span>
                <span className="grow">{t.title}</span>
                {t.due && <span className="mono small muted">{fmtDate(t.due)}</span>}
              </li>
            ))}
          </ol>
        </section>

        <section className="cell cell-ink countdown">
          <header className="cell-head"><h2>Próxima prova</h2></header>
          {next ? (
            <>
              <div className="count-num">{daysUntil(next.targetDate)}</div>
              <div className="count-unit mono">dias restantes</div>
              <div className="count-name">{next.name}</div>
              <div className="count-meta mono">
                <span>{fmtDateLong(next.targetDate)}</span>
                <span>{CERT_STATUS[next.status]?.label}</span>
              </div>
              <Progress value={next.progress} color="var(--orange)" />
              <span className="mono small">{next.progress}% preparado</span>
            </>
          ) : (
            <p>Nenhuma prova com data. <button className="cell-link mono" onClick={() => go('certificacoes')}>Planejar →</button></p>
          )}
        </section>
      </div>

      <div className="cells dash-b">
        <section className="cell">
          <header className="cell-head">
            <h2>Fluxo de caixa</h2>
            <div className="legend mono"><span><i style={{ background: 'var(--ink)' }} />Entra</span><span><i style={{ background: 'var(--orange)' }} />Sai</span></div>
          </header>
          <MonthBars data={months} />
        </section>

        <section className="cell">
          <header className="cell-head">
            <h2>Hábitos de hoje</h2>
            <span className="mono small">{habitsDone}/{habits.length}</span>
          </header>
          <ul className="checklist">
            {habits.map((x) => (
              <li key={x.id}>
                <button className={`check ${x.log?.[today] ? 'on' : ''}`} onClick={() => toggleHabit(x)} aria-pressed={!!x.log?.[today]}>
                  <span className="box" aria-hidden="true"><Icon name="check" size={13} /></span>
                  <span>{x.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="cell">
          <header className="cell-head">
            <h2>Fixados</h2>
            <button className="cell-link mono" onClick={() => go('documentos')}>Arquivo →</button>
          </header>
          <ul className="pins">
            {pinned.length === 0 && <li className="muted small">Fixe documentos para acessá-los aqui.</li>}
            {pinned.map((d) => (
              <li key={d.id}>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer">
                    <span className="grow">{d.title}<small className="mono">{hostOf(d.url)}</small></span>
                    <span className="mono arrow">↗</span>
                  </a>
                ) : (
                  <button onClick={() => go('documentos')}>
                    <span className="grow">{d.title}<small className="mono">{d.category}</small></span>
                    <span className="mono arrow">→</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
