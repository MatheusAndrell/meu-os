import { useRef } from 'react'
import { useStore } from '../store'
import { Icon, PageHeader, useToast } from '../ui'
import { EMPTY, seed } from '../seed'
import { iso } from '../utils'

export default function Settings() {
  const { state, set, replace } = useStore()
  const toast = useToast()
  const fileRef = useRef(null)
  const s = state.settings
  const setS = (patch) => set('settings', { ...s, ...patch })

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `meu-os-backup-${iso(new Date())}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Backup exportado')
  }

  const importJson = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!data || typeof data !== 'object' || !Array.isArray(data.skills)) throw new Error('formato')
      const base = { ...EMPTY, settings: s }
      replace({ ...base, ...data, settings: { ...s, ...(data.settings || {}) } })
      toast('Backup importado')
    } catch {
      window.alert('Arquivo inválido. Use um backup exportado pelo Meu OS.')
    }
  }

  const clearExamples = () => {
    if (!window.confirm('Apagar todos os itens (tecnologias, tarefas, finanças…) e começar do zero?')) return
    replace({ ...EMPTY, settings: { ...s, focus: '' } })
    toast('Tudo limpo — comece do zero')
  }
  const restore = () => {
    if (!window.confirm('Substituir seus dados pelos dados de exemplo?')) return
    replace({ ...seed(), settings: s })
    toast('Dados de exemplo restaurados')
  }

  const counts = [
    ['Tecnologias', state.skills.length], ['Certificações', state.certs.length], ['Tarefas', state.tasks.length],
    ['Transações', state.transactions.length], ['Documentos', state.docs.length], ['Hábitos', state.habits.length],
  ]

  return (
    <>
      <PageHeader n={8} title="Ajustes" meta="perfil · aparência · dados" />

      <div className="cells c2 settings-grid">
        <section className="cell">
          <header className="cell-head"><h2>Perfil</h2></header>
          <div className="form-grid">
            <label className="field full"><span className="field-label">Nome</span>
              <input className="input" value={s.name} onChange={(e) => setS({ name: e.target.value })} /></label>
            <label className="field full"><span className="field-label">Função</span>
              <input className="input" value={s.role} onChange={(e) => setS({ role: e.target.value })} /></label>
          </div>
          <div className="divider" />
          <header className="cell-head"><h2>Aparência</h2></header>
          <div className="theme-pick">
            {['dark', 'light'].map((t) => (
              <button key={t} className={`theme-opt ${s.theme === t ? 'on' : ''}`} data-preview={t} onClick={() => setS({ theme: t })} aria-pressed={s.theme === t}>
                <span className="theme-swatch"><i /><i /><i /></span>
                {t === 'dark' ? 'Tinta' : 'Papel'}
              </button>
            ))}
          </div>
        </section>

        <section className="cell">
          <header className="cell-head"><h2>Seus dados</h2></header>
          <p className="muted small">Tudo fica salvo neste navegador (localStorage). Exporte um backup de vez em quando e importe-o em outro computador ou navegador.</p>
          <div className="count-grid">
            {counts.map(([l, n]) => <div key={l}><strong>{n}</strong><span className="small muted">{l}</span></div>)}
          </div>
          <div className="btn-row">
            <button className="btn primary" onClick={exportJson}><Icon name="download" size={16} /> Exportar backup</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="upload" size={16} /> Importar backup</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
          </div>
          <div className="divider" />
          <header className="cell-head"><h2>Zona de reset</h2></header>
          <div className="btn-row">
            <button className="btn ghost danger" onClick={clearExamples}><Icon name="trash" size={16} /> Começar do zero</button>
            <button className="btn ghost" onClick={restore}><Icon name="refresh" size={16} /> Restaurar exemplo</button>
          </div>
        </section>

        <section className="cell span-all shortcuts">
          <header className="cell-head"><h2>Atalhos</h2></header>
          <ul>
            <li><kbd className="mono">⌘/Ctrl K</kbd> Paleta de comandos: navegar, criar itens, abrir documentos</li>
            <li><kbd className="mono">Esc</kbd> Fechar janelas</li>
            <li><kbd className="mono">Arrastar</kbd> Mover tarefas entre colunas do quadro</li>
            <li><kbd className="mono">Clique nos níveis</kbd> Ajustar o nível de uma tecnologia direto no cartão</li>
          </ul>
        </section>
      </div>
    </>
  )
}
