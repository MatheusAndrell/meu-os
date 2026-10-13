import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from './store'
import { Icon } from './ui'
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
  { id: 'inicio', label: 'Início', icon: 'home', C: Dashboard },
  { id: 'stack', label: 'Tecnologias', icon: 'layers', C: Skills },
  { id: 'certificacoes', label: 'Certificações', icon: 'award', C: Certs },
  { id: 'tarefas', label: 'Tarefas', icon: 'kanban', C: Kanban },
  { id: 'financas', label: 'Finanças', icon: 'wallet', C: Finance },
  { id: 'documentos', label: 'Documentos', icon: 'file', C: Docs },
  { id: 'habitos', label: 'Hábitos', icon: 'flame', C: Habits },
  { id: 'ajustes', label: 'Ajustes', icon: 'settings', C: Settings },
]

const readHash = () => window.location.hash.replace(/^#\/?/, '') || 'inicio'

export default function App() {
  const { state, set } = useStore()
  const [route, setRoute] = useState(readHash)
  const [palette, setPalette] = useState(false)

  useEffect(() => {
    const h = () => setRoute(readHash())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

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

  useEffect(() => window.scrollTo(0, 0), [route])

  const go = (id) => { window.location.hash = `/${id}` }
  const dark = state.settings.theme === 'dark'
  const toggleTheme = () => set('settings', { ...state.settings, theme: dark ? 'light' : 'dark' })
  const page = PAGES.find((p) => p.id === route) || PAGES[0]
  const Page = page.C
  const initial = (state.settings.name || 'M').trim().charAt(0).toUpperCase()

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#/inicio">
          <div className="brand-mark">{initial}</div>
          <div>
            <div className="brand-name">Meu<em>OS</em></div>
            <div className="brand-sub mono">painel pessoal</div>
          </div>
        </a>
        <button className="search-trigger" onClick={() => setPalette(true)}>
          <Icon name="search" size={16} />
          <span>Buscar ou executar</span>
          <kbd className="mono">⌘K</kbd>
        </button>
        <nav className="nav" aria-label="Principal">
          {PAGES.map((p, i) => (
            <a key={p.id} href={`#/${p.id}`} className={`nav-item ${p.id === page.id ? 'active' : ''}`}
              aria-current={p.id === page.id ? 'page' : undefined}>
              <Icon name={p.icon} />
              <span className="nav-label">{p.label}</span>
              <span className="nav-num mono">{pad(i + 1)}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="me">
            <div className="avatar">{initial}</div>
            <div className="me-text">
              <div className="me-name">{state.settings.name}</div>
              <div className="me-role">{state.settings.role}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={toggleTheme} aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}>
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>
        </div>
      </aside>

      <header className="mobile-top">
        <a className="brand" href="#/inicio">
          <div className="brand-mark">{initial}</div>
          <div className="brand-name">Meu<em>OS</em></div>
        </a>
        <div className="row gap-8">
          <button className="icon-btn" onClick={() => setPalette(true)} aria-label="Buscar"><Icon name="search" /></button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Alternar tema"><Icon name={dark ? 'sun' : 'moon'} /></button>
        </div>
      </header>

      <main className="main" key={page.id}>
        <Page go={go} />
      </main>

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
      ...PAGES.map((p) => ({ label: `Ir para ${p.label}`, icon: p.icon, group: 'Navegar', run: () => go(p.id) })),
      create('Nova tarefa', 'tarefas'),
      create('Nova transação', 'financas'),
      create('Nova certificação', 'certificacoes'),
      create('Nova tecnologia', 'stack'),
      create('Novo documento', 'documentos'),
      { label: 'Alternar tema claro / escuro', icon: 'sun', group: 'Sistema', run: toggleTheme },
      ...state.docs.filter((d) => d.url).map((d) => ({ label: d.title, icon: 'external', group: 'Documentos', run: () => window.open(d.url, '_blank', 'noopener') })),
      ...state.skills.map((s) => ({ label: s.name, hint: `${LEVELS[s.level]} · ${s.level}/5`, icon: 'layers', group: 'Tecnologias', run: () => go('stack') })),
      ...state.certs.map((c) => ({ label: c.name, hint: c.provider, icon: 'award', group: 'Certificações', run: () => go('certificacoes') })),
    ]
  }, [state, go, toggleTheme])

  const items = (q ? all.filter((it) => norm(`${it.label} ${it.hint || ''}`).includes(norm(q))) : all.filter((it) => ['Navegar', 'Criar', 'Sistema'].includes(it.group))).slice(0, 40)

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
          <Icon name="search" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Busque páginas, tecnologias, documentos…" aria-label="Buscar" />
          <kbd className="mono">esc</kbd>
        </div>
        <ul className="palette-list" ref={listRef} role="listbox">
          {items.length === 0 && <li className="palette-empty">Nada encontrado para “{q}”.</li>}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null
            lastGroup = it.group
            return (
              <li key={`${it.group}-${it.label}-${i}`}>
                {header && <div className="palette-group mono">{header}</div>}
                <button role="option" aria-selected={i === active} data-active={i === active}
                  className={`palette-item ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => run(it)}>
                  <Icon name={it.icon} size={16} />
                  <span>{it.label}</span>
                  {it.hint && <span className="palette-hint mono">{it.hint}</span>}
                  <Icon name="arrowR" size={14} className="palette-go" />
                </button>
              </li>
            )
          })}
        </ul>
        <div className="palette-foot mono">
          <span>↑↓ navegar</span><span>↵ abrir</span><span>⌘K fechar</span>
        </div>
      </div>
    </div>
  )
}
