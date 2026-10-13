import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { seed } from './seed'

export const STORAGE_KEY = 'meu-os:v1'
const StoreCtx = createContext(null)

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const base = seed()
      const settings = { ...base.settings, ...(parsed.settings || {}) }
      // Novo visual (v2): começa no modo papel uma única vez
      if (settings.design !== 2) Object.assign(settings, { design: 2, theme: 'light' })
      return { ...base, ...parsed, settings }
    }
  } catch {}
  return seed()
}

function reducer(state, a) {
  switch (a.type) {
    case 'add':
      return { ...state, [a.key]: [...state[a.key], { id: uid(), ...a.item }] }
    case 'update':
      return { ...state, [a.key]: state[a.key].map((x) => (x.id === a.id ? { ...x, ...a.patch } : x)) }
    case 'remove':
      return { ...state, [a.key]: state[a.key].filter((x) => x.id !== a.id) }
    case 'set':
      return { ...state, [a.key]: a.value }
    case 'replace':
      return a.state
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.settings.theme === 'dark' ? '#121211' : '#EFEEE9')
  }, [state.settings.theme])

  const api = useMemo(
    () => ({
      add: (key, item) => dispatch({ type: 'add', key, item }),
      update: (key, id, patch) => dispatch({ type: 'update', key, id, patch }),
      remove: (key, id) => dispatch({ type: 'remove', key, id }),
      set: (key, value) => dispatch({ type: 'set', key, value }),
      replace: (s) => dispatch({ type: 'replace', state: s }),
    }),
    []
  )

  const value = useMemo(() => ({ state, ...api }), [state, api])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)
