import { iso, addDays, addMonths } from './utils'

export const EMPTY = {
  skills: [],
  certs: [],
  tasks: [],
  transactions: [],
  goals: [],
  docs: [],
  habits: [],
}

let n = 0
const id = () => `s${(n++).toString(36)}`

export function seed() {
  const t = new Date()
  const d = (k) => iso(addDays(t, k))

  const skills = [
    ['Laravel', 'Backend', 4, 'usando'], ['PHP', 'Backend', 4, 'usando'], ['Composer', 'Backend', 3, 'usando'],
    ['API REST', 'Backend', 4, 'usando'], ['NodeJs', 'Backend', 2, 'estudando'], ['Java', 'Backend', 1, 'fila'],
    ['Evolution API', 'Backend', 3, 'usando'],
    ['JavaScript', 'Frontend', 4, 'usando'], ['HTML5', 'Frontend', 4, 'usando'], ['CSS3', 'Frontend', 4, 'usando'],
    ['React', 'Frontend', 3, 'estudando'], ['React Native', 'Frontend', 2, 'estudando'], ['VueJs', 'Frontend', 3, 'usando'],
    ['NuxtJs', 'Frontend', 2, 'estudando'], ['Bootstrap', 'Frontend', 4, 'usando'], ['Tailwind CSS', 'Frontend', 3, 'usando'],
    ['jQuery', 'Frontend', 4, 'usando'], ['Vite', 'Frontend', 3, 'usando'],
    ['PostgreSQL', 'Dados', 3, 'usando'], ['MySQL', 'Dados', 4, 'usando'], ['NoSQL', 'Dados', 2, 'estudando'],
    ['MongoDB', 'Dados', 2, 'estudando'],
    ['Docker', 'DevOps', 3, 'usando'], ['AWS', 'DevOps', 2, 'estudando'], ['Linux', 'DevOps', 3, 'usando'],
    ['Git/GitHub', 'DevOps', 4, 'usando'],
    ['UX', 'Design', 2, 'estudando'], ['UI Design', 'Design', 2, 'estudando'], ['Figma', 'Design', 3, 'usando'],
    ['Inglês', 'Idiomas', 3, 'estudando'], ['Português', 'Idiomas', 5, 'usando'], ['Espanhol', 'Idiomas', 2, 'fila'],
  ].map(([name, category, level, status]) => ({ id: id(), name, category, level, status, goal: '', notes: '' }))

  const certs = [
    { name: 'AWS Certified Cloud Practitioner', provider: 'AWS', status: 'estudando', progress: 35, targetDate: d(48), link: 'https://aws.amazon.com/certification/' },
    { name: 'GitHub Foundations', provider: 'GitHub', status: 'agendada', progress: 70, targetDate: d(19), link: '' },
    { name: 'Laravel Certification', provider: 'Laravel', status: 'planejada', progress: 10, targetDate: d(120), link: '' },
    { name: 'AWS Solutions Architect – Associate', provider: 'AWS', status: 'planejada', progress: 0, targetDate: d(200), link: 'https://aws.amazon.com/certification/' },
    { name: 'MongoDB Associate Developer', provider: 'MongoDB', status: 'planejada', progress: 0, targetDate: d(260), link: '' },
    { name: 'Java SE 17 Developer', provider: 'Oracle', status: 'planejada', progress: 0, targetDate: '', link: '' },
    { name: 'Scrum Fundamentals', provider: 'SCRUMstudy', status: 'concluida', progress: 100, targetDate: d(-90), link: '' },
  ].map((c) => ({ id: id(), cost: '', notes: '', ...c }))

  const tasks = [
    ['Configurar filas com Redis no projeto', 'doing', 'alta', 'Trabalho', d(2)],
    ['Simulado AWS CCP — módulo 3', 'doing', 'media', 'Estudos', d(4)],
    ['Refatorar webhooks da Evolution API', 'todo', 'alta', 'Trabalho', d(6)],
    ['Ler capítulo de índices no PostgreSQL', 'todo', 'baixa', 'Estudos', ''],
    ['Atualizar portfólio com projetos de 2026', 'backlog', 'media', 'Carreira', ''],
    ['Montar app pessoal em React Native', 'backlog', 'baixa', 'Estudos', ''],
    ['Organizar planilha de gastos de setembro', 'done', 'media', 'Pessoal', ''],
    ['Dockerizar ambiente local do Laravel', 'done', 'alta', 'Trabalho', ''],
  ].map(([title, column, priority, tag, due]) => ({ id: id(), title, column, priority, tag, due, desc: '' }))

  const transactions = []
  for (let m = 5; m >= 0; m--) {
    const base = addMonths(t, -m)
    const day = (dd) => iso(new Date(base.getFullYear(), base.getMonth(), dd))
    const v = (x, k) => Math.round(x * (1 + (((m * 7 + k * 3) % 9) - 4) / 40))
    const rows = [
      ['in', 'Salário', 'Salário', 7500, 5],
      ['out', 'Aluguel', 'Moradia', 1800, 6],
      ['out', 'Supermercado', 'Mercado', v(950, 1), 9],
      ['out', 'Combustível / Uber', 'Transporte', v(380, 2), 12],
      ['out', 'Streaming e apps', 'Assinaturas', 129, 14],
      ['out', 'Curso online', 'Educação', v(180, 3), 16],
      ['out', 'Restaurantes', 'Lazer', v(520, 4), 21],
      ['out', 'Farmácia', 'Saúde', v(140, 5), 23],
    ]
    if (m % 2 === 0) rows.push(['in', 'Projeto freelance', 'Freelance', v(1800, 6), 18])
    rows.forEach(([type, desc, category, amount, dd]) => {
      const date = day(dd)
      if (date <= iso(t)) transactions.push({ id: id(), type, desc, category, amount, date })
    })
  }

  const goals = [
    { name: 'Reserva de emergência', target: 30000, current: 12400 },
    { name: 'Notebook novo', target: 9000, current: 3200 },
    { name: 'Viagem de fim de ano', target: 6000, current: 1500 },
  ].map((g) => ({ id: id(), ...g }))

  const docs = [
    ['Documentação Laravel', 'Estudos', 'https://laravel.com/docs', 'Referência principal do framework', true],
    ['Manual do PHP', 'Estudos', 'https://www.php.net/manual/pt_BR/', '', false],
    ['MDN Web Docs', 'Estudos', 'https://developer.mozilla.org/pt-BR/', 'HTML, CSS e JavaScript', true],
    ['React', 'Estudos', 'https://react.dev', '', false],
    ['Vue.js', 'Estudos', 'https://vuejs.org', '', false],
    ['Docker Docs', 'Estudos', 'https://docs.docker.com', '', false],
    ['AWS Docs', 'Estudos', 'https://docs.aws.amazon.com', '', false],
    ['PostgreSQL Docs', 'Estudos', 'https://www.postgresql.org/docs/', '', false],
    ['CNH — renovação', 'Pessoal', '', 'Anotar data de vencimento e onde está a cópia digital', true],
    ['Declaração do IR', 'Financeiro', '', 'Pasta com recibos e informes de rendimento', false],
    ['Exames anuais', 'Saúde', '', 'Check-up: agendar em janeiro', false],
  ].map(([title, category, url, note, pinned]) => ({ id: id(), title, category, url, note, pinned }))

  const habits = ['Estudar 1h', 'Exercício físico', 'Leitura 20 min', 'Inglês 15 min', 'Dormir antes das 23h'].map((name, hi) => {
    const log = {}
    for (let k = 1; k <= 20; k++) if ((k * (hi + 3) + hi) % 5 < 3 || k < 3) log[d(-k)] = true
    return { id: id(), name, log }
  })

  return {
    settings: { name: 'Matheus', role: 'Desenvolvedor Full Stack', theme: 'light', focus: '', design: 2 },
    skills, certs, tasks, transactions, goals, docs, habits,
  }
}
