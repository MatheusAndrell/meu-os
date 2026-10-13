export const SKILL_CATEGORIES = [
  { id: 'Backend', code: 'BCK', color: 'var(--orange)' },
  { id: 'Frontend', code: 'FRT', color: 'var(--blue)' },
  { id: 'Dados', code: 'DAT', color: 'var(--green)' },
  { id: 'DevOps', code: 'OPS', color: 'var(--yellow)' },
  { id: 'Design', code: 'DSG', color: 'var(--pink)' },
  { id: 'Idiomas', code: 'LNG', color: 'var(--ink)' },
]
export const catColor = (id) => SKILL_CATEGORIES.find((c) => c.id === id)?.color || 'var(--muted)'
export const catCode = (id) => SKILL_CATEGORIES.find((c) => c.id === id)?.code || '---'

export const LEVELS = ['', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Especialista']

export const SKILL_STATUS = {
  usando: { label: 'Usando', color: 'var(--green)' },
  estudando: { label: 'Estudando', color: 'var(--orange)' },
  fila: { label: 'Na fila', color: 'var(--muted)' },
  pausado: { label: 'Pausado', color: 'var(--pink)' },
}

export const CERT_STATUS = {
  planejada: { label: 'Planejada', color: 'var(--muted)' },
  estudando: { label: 'Estudando', color: 'var(--orange)' },
  agendada: { label: 'Agendada', color: 'var(--blue)' },
  concluida: { label: 'Concluída', color: 'var(--green)' },
}

export const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'A fazer' },
  { id: 'doing', label: 'Fazendo' },
  { id: 'done', label: 'Feito' },
]

export const PRIORITIES = {
  baixa: { label: 'Baixa', level: 1 },
  media: { label: 'Média', level: 2 },
  alta: { label: 'Alta', level: 3 },
}

export const FIN_IN = ['Salário', 'Freelance', 'Investimentos', 'Outros']
export const FIN_OUT = ['Moradia', 'Mercado', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Outros']
const PALETTE = ['var(--orange)', 'var(--blue)', 'var(--green)', 'var(--yellow)', 'var(--pink)', 'var(--ink)', 'var(--violet)', 'var(--muted)']
export const finColor = (cat) => PALETTE[Math.max(0, FIN_OUT.indexOf(cat)) % PALETTE.length]

export const DOC_CATEGORIES = ['Estudos', 'Trabalho', 'Pessoal', 'Financeiro', 'Saúde']
export const docColor = (c) => PALETTE[Math.max(0, DOC_CATEGORIES.indexOf(c))]

export const toOptions = (obj) => Object.entries(obj).map(([value, v]) => ({ value, label: v.label }))
