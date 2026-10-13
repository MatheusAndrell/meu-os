export const SKILL_CATEGORIES = [
  { id: 'Backend', color: 'var(--coral)' },
  { id: 'Frontend', color: 'var(--sky)' },
  { id: 'Dados', color: 'var(--violet)' },
  { id: 'DevOps', color: 'var(--mint)' },
  { id: 'Design', color: 'var(--pink)' },
  { id: 'Idiomas', color: 'var(--amber)' },
]
export const catColor = (id) => SKILL_CATEGORIES.find((c) => c.id === id)?.color || 'var(--muted)'

export const LEVELS = ['', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Especialista']

export const SKILL_STATUS = {
  usando: { label: 'Usando', color: 'var(--mint)' },
  estudando: { label: 'Estudando', color: 'var(--amber)' },
  fila: { label: 'Na fila', color: 'var(--muted)' },
  pausado: { label: 'Pausado', color: 'var(--coral)' },
}

export const CERT_STATUS = {
  planejada: { label: 'Planejada', color: 'var(--muted)' },
  estudando: { label: 'Estudando', color: 'var(--amber)' },
  agendada: { label: 'Agendada', color: 'var(--sky)' },
  concluida: { label: 'Concluída', color: 'var(--mint)' },
}

export const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'A fazer' },
  { id: 'doing', label: 'Fazendo' },
  { id: 'done', label: 'Feito' },
]

export const PRIORITIES = {
  baixa: { label: 'Baixa', color: 'var(--sky)' },
  media: { label: 'Média', color: 'var(--amber)' },
  alta: { label: 'Alta', color: 'var(--coral)' },
}

export const FIN_IN = ['Salário', 'Freelance', 'Investimentos', 'Outros']
export const FIN_OUT = ['Moradia', 'Mercado', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Outros']
const PALETTE = ['var(--coral)', 'var(--sky)', 'var(--violet)', 'var(--mint)', 'var(--amber)', 'var(--pink)', 'var(--accent)', 'var(--muted)']
export const finColor = (cat) => PALETTE[Math.max(0, FIN_OUT.indexOf(cat)) % PALETTE.length]

export const DOC_CATEGORIES = ['Estudos', 'Trabalho', 'Pessoal', 'Financeiro', 'Saúde']
export const docColor = (c) => PALETTE[Math.max(0, DOC_CATEGORIES.indexOf(c))]

export const toOptions = (obj) => Object.entries(obj).map(([value, v]) => ({ value, label: v.label }))
