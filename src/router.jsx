import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const RouterCtx = createContext(null)
const clean = (p) => p.replace(/\/+$/, '') || '/'

function initialPath() {
  // Converte links antigos (#/stack) para o formato novo (/stack)
  const m = window.location.hash.match(/^#\/(.*)$/)
  if (m) {
    const p = !m[1] || m[1] === 'inicio' ? '/' : `/${m[1]}`
    window.history.replaceState(null, '', p)
    return p
  }
  return clean(window.location.pathname)
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    const onPop = () => setPath(clean(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, { replace = false } = {}) => {
    const target = clean(to)
    if (target !== clean(window.location.pathname)) {
      window.history[replace ? 'replaceState' : 'pushState'](null, '', target)
    }
    setPath(target)
    window.scrollTo(0, 0)
  }, [])

  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>
}

export const useRouter = () => useContext(RouterCtx)

export function Link({ to, onClick, ...rest }) {
  const { navigate } = useRouter()
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
    />
  )
}
