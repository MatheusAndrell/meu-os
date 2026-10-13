export const pad = (n) => String(n).padStart(2, '0')
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d || 1)
}
export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)
export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
export const daysUntil = (s) => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return Math.round((parseISO(s) - t) / 86400000)
}
const brlF = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const brl = (n) => brlF.format(n || 0)
export const brlShort = (n) =>
  Math.abs(n) >= 1000 ? `R$ ${(n / 1000).toFixed(1).replace('.', ',')}k` : `R$ ${Math.round(n)}`
export const fmtDate = (s) =>
  s ? parseISO(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').replace(' de ', ' ') : ''
export const fmtDateLong = (s) =>
  s ? parseISO(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').replace(/ de /g, ' ') : ''
export const monthName = (d) => {
  const m = d.toLocaleDateString('pt-BR', { month: 'long' })
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${d.getFullYear()}`
}
export const monthShort = (d) => d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
export const relDays = (n) =>
  n === 0 ? 'hoje' : n === 1 ? 'amanhã' : n === -1 ? 'ontem' : n > 0 ? `em ${n} dias` : `há ${-n} dias`
export const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
export const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0)
export const hostOf = (url) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}
export const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const emitNew = (page) => setTimeout(() => window.dispatchEvent(new CustomEvent('os:new', { detail: page })), 60)
