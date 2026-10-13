import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LEVELS } from './constants'
import { pad } from './utils'

/* ───────── Icons ───────── */
const P = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 13 9 5 9-5" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" /></>,
  kanban: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></>,
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z" /><circle cx="16" cy="14.5" r="1.2" /></>,
  file: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  flame: <path d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0C7 10 9 8.5 9 8.5s0 3 2.5 3.5C11 8 12 3 12 3z" />,
  settings: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M20 6 9 17l-5-5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  upload: <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />,
  pin: <path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v8" />,
  up: <path d="M7 17 17 7M8 7h9v9" />,
  down: <path d="M7 7l10 10M17 8v9H8" />,
  chevL: <path d="m15 6-6 6 6 6" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
}

export function Icon({ name, size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {P[name]}
    </svg>
  )
}

/* ───────── Toast ───────── */
const ToastCtx = createContext(() => {})
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const toast = useCallback((m) => {
    setMsg({ m, k: Date.now() })
  }, [])
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2600)
    return () => clearTimeout(t)
  }, [msg])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {msg && (
        <div className="toast" key={msg.k} role="status">
          <Icon name="check" size={16} /> {msg.m}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* ───────── Hooks ───────── */
export function useNewTrigger(page, cb) {
  useEffect(() => {
    const h = (e) => e.detail === page && cb()
    window.addEventListener('os:new', h)
    return () => window.removeEventListener('os:new', h)
  })
}

export function useClock(ms = 15000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

/* ───────── Layout bits ───────── */
export function PageHeader({ n, kicker, title, accent, children }) {
  return (
    <header className="page-head">
      <div>
        <div className="kicker mono">
          <span className="kicker-num">{pad(n)}</span> / {kicker}
        </div>
        <h1 className="display">
          {title} {accent && <em>{accent}</em>}
        </h1>
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  )
}

export function Pill({ color, children, dot = true }) {
  return (
    <span className="pill" style={{ '--c': color }}>
      {dot && <i />}
      {children}
    </span>
  )
}

export function Chips({ value, onChange, options }) {
  return (
    <div className="chips" role="tablist">
      {options.map((o) => {
        const op = typeof o === 'string' ? { value: o, label: o } : o
        return (
          <button key={op.value} role="tab" aria-selected={value === op.value}
            className={`chip ${value === op.value ? 'on' : ''}`} onClick={() => onChange(op.value)}>
            {op.color && <i style={{ background: op.color }} />}
            {op.label}
            {op.count != null && <span className="chip-count">{op.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Levels({ value, color, onSet }) {
  return (
    <div className="levels" style={{ '--c': color }}>
      {[1, 2, 3, 4, 5].map((n) =>
        onSet ? (
          <button key={n} className={`seg ${n <= value ? 'on' : ''}`} onClick={() => onSet(n)}
            aria-label={`Definir nível ${n}: ${LEVELS[n]}`} title={LEVELS[n]} />
        ) : (
          <span key={n} className={`seg ${n <= value ? 'on' : ''}`} />
        )
      )}
    </div>
  )
}

export function Progress({ value, color = 'var(--accent)' }) {
  return (
    <div className="progress" style={{ '--c': color }}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function Empty({ icon = 'sparkle', title, children }) {
  return (
    <div className="empty">
      <Icon name={icon} size={22} />
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}

/* ───────── Modal & forms ───────── */
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body
  )
}

function LevelPicker({ value, onChange }) {
  return (
    <div className="level-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n === value ? 'on' : ''} onClick={() => onChange(n)}>
          <b>{n}</b>
          <span>{LEVELS[n]}</span>
        </button>
      ))}
    </div>
  )
}

function Field({ f, value, onChange, values }) {
  const id = `f-${f.name}`
  const opts = typeof f.options === 'function' ? f.options(values) : f.options
  let input
  switch (f.type) {
    case 'textarea':
      input = <textarea id={id} className="input" rows={3} value={value ?? ''} placeholder={f.placeholder}
        onChange={(e) => onChange(e.target.value)} />
      break
    case 'select':
      input = (
        <select id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={f.required}>
          {!f.required && <option value="">—</option>}
          {opts.map((o) => {
            const op = typeof o === 'string' ? { value: o, label: o } : o
            return <option key={op.value} value={op.value}>{op.label}</option>
          })}
        </select>
      )
      break
    case 'range':
      input = (
        <div className="range-row">
          <input id={id} type="range" min={f.min ?? 0} max={f.max ?? 100} step={f.step ?? 5} value={value ?? 0}
            onChange={(e) => onChange(Number(e.target.value))} />
          <span className="mono">{value ?? 0}{f.suffix}</span>
        </div>
      )
      break
    case 'level':
      return (
        <div className={`field ${f.full ? 'full' : ''}`}>
          <span className="field-label">{f.label}</span>
          <LevelPicker value={value || 1} onChange={onChange} />
        </div>
      )
    default:
      input = <input id={id} className="input" type={f.type || 'text'} value={value ?? ''} required={f.required}
        placeholder={f.placeholder} step={f.step} min={f.min} onChange={(e) => onChange(e.target.value)} />
  }
  return (
    <label className={`field ${f.full ? 'full' : ''}`} htmlFor={id}>
      <span className="field-label">{f.label}</span>
      {input}
    </label>
  )
}

export function FormModal({ open, onClose, title, fields, initial, onSubmit, onDelete, submitLabel = 'Salvar' }) {
  const [v, setV] = useState({})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) setV(initial || {}) }, [open])
  const submit = (e) => {
    e.preventDefault()
    const out = { ...v }
    fields.forEach((f) => {
      if (['number', 'range', 'level'].includes(f.type)) out[f.name] = Number(out[f.name] || 0)
    })
    onSubmit(out)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={submit}>
        <div className="form-grid">
          {fields.map((f) => (
            <Field key={f.name} f={f} value={v[f.name]} values={v} onChange={(val) => setV((p) => ({ ...p, [f.name]: val }))} />
          ))}
        </div>
        <footer className="modal-foot">
          {onDelete && (
            <button type="button" className="btn ghost danger"
              onClick={() => { if (window.confirm('Excluir este item?')) { onDelete(); onClose() } }}>
              <Icon name="trash" size={16} /> Excluir
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">{submitLabel}</button>
        </footer>
      </form>
    </Modal>
  )
}
