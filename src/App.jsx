import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from './store'
import { Link, useRouter } from './router'
import { Icon, useClock } from './ui'
import { LEVELS } from './constants'
import { emitNew, norm, pad } from './utils'
import Dashboard from './pages/Dashboard'
import Skills from './pages/Skills'
import Certs from './pages/Certs'
import Kanban from './pages/Kanban'
import Finance from './pages/Finance'
import Docs from './pages/Docs'
import Habits from './pages/Habits'
import Settings from './pages/Settings'

export const PAGES = [
  { id: 'inicio', path: '/', label: 'Início', C: Dashboard },
  { id: 'stack', path: '/stack', label: 'Stack', C: Skills },
  { id: 'certificacoes', path: '/certificacoes', label: 'Certificações', C: Certs },
  { id: 'tarefas', path: '/tarefas', label: 'Tarefas', C: Kanban },
  { id: 'financas', path: '/financas', label: 'Finanças', C: Finance },
  { id: 'documentos', path: '/documentos', label: 'Documentos', C: Docs },
  { id: 'habitos', path: '/habitos', label: 'Hábitos', C: Habits },
  { id: 'ajustes', path: '/ajustes', label: 'Ajustes', C: Settings },
]

const dayOfYear = (d) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)

export default function App() {
  const { state, set } = useStore()
  const { path, navigate } = useRouter()
  const [palette, setPalette] = useState(false)
  const now = useClock()

  const page = PAGES.find((p) => p.path === path)

  // Rota desconhecida → início
  useEffect(() => {
    if (!page) navigate('/', { replace: true })
  }, [page, navigate])

  useEffect(() => {
    document.title = page && page.id !== 'inicio' ? `${page.label} — Meu OS` : 'Meu OS'
  }, [page])

  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const go = (id) => navigate(PAGES.find((p) => p.id === id)?.path || '/')
  const dark = state.settings.theme === 'dark'
  const toggleTheme = () => set('settings', { ...state.settings, theme: dark ? 'light' : 'dark' })
  const current = page || PAGES[0]
  const Page = current.C
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.', '').replace(',', '')

  return (
    <div className="app">
      <header className="mast">
        <Link to="/" className="mast-logo" aria-label="Meu OS — início">
          <span className="logo-box" aria-hidden="true">M</span>
          <span className="logo-word">Meu OS</span>
        </Link>
        <span className="mast-cell mono hide-md">Vol. 01 — Nº {dayOfYear(now)}</span>
        <span className="mast-cell mono hide-sm">{dateStr} · {pad(now.getHours())}:{pad(now.getMinutes())}</span>
        <span className="mast-fill" />
        <button className="mast-btn" onClick={() => setPalette(true)}>
          <Icon name="search" size={15} />
          <span className="hide-sm">Buscar</span>
          <kbd className="mono hide-sm">⌘K</kbd>
        </button>
        <button className="mast-btn" onClick={toggleTheme} aria-label={dark ? 'Mudar para modo papel' : 'Mudar para modo tinta'}>
          <span className="theme-dot" aria-hidden="true" />
          <span className="hide-sm">{dark ? 'Papel' : 'Tinta'}</span>
        </button>
      </header>

      <nav className="tabs" aria-label="Seções">
        {PAGES.map((p, i) => (
          <Link key={p.id} to={p.path} className={`tab ${p.id === current.id ? 'on' : ''}`}
            aria-current={p.id === current.id ? 'page' : undefined}>
            <span className="tab-n mono">{pad(i + 1)}</span>
            <span className="tab-label">{p.label}</span>
          </Link>
        ))}
      </nav>

      <main className="main">
        <Page go={go} />
      </main>

      <footer className="colophon mono">
        <span>Meu OS — caderno de {state.settings.name || 'bordo'}</span>
        <span>Dados salvos neste navegador</span>
        <span>⌘K para tudo</span>
      </footer>

      {palette && <CommandPalette onClose={() => setPalette(false)} go={go} toggleTheme={toggleTheme} />}
    </div>
  )
}

function CommandPalette({ onClose, go, toggleTheme }) {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef(null)

  const all = useMemo(() => {
    const create = (label, page) => ({ label, icon: 'plus', group: 'Criar', run: () => { go(page); emitNew(page) } })
    return [
      ...PAGES.map((p, i) => ({ label: p.label, hint: pad(i + 1), icon: 'arrowR', group: 'Ir para', run: () => go(p.id) })),
      create('Nova tarefa', 'tarefas'),
      create('Nova transação', 'financas'),
      create('Nova certificação', 'certificacoes'),
      create('Nova tecnologia', 'stack'),
      create('Novo documento', 'documentos'),
      { label: 'Alternar papel / tinta', icon: 'sun', group: 'Sistema', run: toggleTheme },
      ...state.docs.filter((d) => d.url).map((d) => ({ label: d.title, icon: 'external', group: 'Documentos', run: () => window.open(d.url, '_blank', 'noopener') })),
      ...state.skills.map((s) => ({ label: s.name, hint: `${s.level}/5 ${LEVELS[s.level]}`, icon: 'layers', group: 'Stack', run: () => go('stack') })),
      ...state.certs.map((c) => ({ label: c.name, hint: c.provider, icon: 'award', group: 'Certificações', run: () => go('certificacoes') })),
    ]
  }, [state, go, toggleTheme])

  const items = (q
    ? all.filter((it) => norm(`${it.label} ${it.hint || ''}`).includes(norm(q)))
    : all.filter((it) => ['Ir para', 'Criar', 'Sistema'].includes(it.group))
  ).slice(0, 40)

  useEffect(() => setActive(0), [q])
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (it) => { onClose(); it.run() }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter' && items[active]) { e.preventDefault(); run(items[active]) }
    else if (e.key === 'Escape') onClose()
  }

  let lastGroup = null
  return (
    <div className="backdrop palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
        <div className="palette-input">
          <span className="mono palette-prompt">&gt;</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Página, tecnologia, documento…" aria-label="Buscar" />
          <kbd className="mono">esc</kbd>
        </div>
        <ul className="palette-list" ref={listRef} role="listbox">
          {items.length === 0 && <li className="palette-empty mono">Nada para “{q}”.</li>}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null
            lastGroup = it.group
            return (
              <li key={`${it.group}-${it.label}-${i}`}>
                {header && <div className="palette-group mono">{header}</div>}
                <button role="option" aria-selected={i === active} data-active={i === active}
                  className={`palette-item ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => run(it)}>
                  <Icon name={it.icon} size={15} />
                  <span className="palette-label">{it.label}</span>
                  {it.hint && <span className="palette-hint mono">{it.hint}</span>}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="palette-foot mono">
          <span>↑↓ mover</span><span>↵ abrir</span><span>esc fechar</span>
        </div>
      </div>
    </div>
  )
}
