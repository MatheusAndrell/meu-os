# Meu OS — painel pessoal

Painel pessoal para organizar tecnologias e níveis, certificações, tarefas (kanban), finanças, documentos e hábitos.

Feito com **React 18 + Vite**, sem backend. Os dados ficam salvos no navegador (localStorage).

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar na Vercel

**Opção 1 — via GitHub (recomendado)**
1. Crie um repositório e suba esta pasta (`git init && git add . && git commit -m "init" && git push`).
2. Na Vercel: **Add New → Project → Import** o repositório.
3. A Vercel detecta Vite automaticamente (build `npm run build`, saída `dist`). Clique em **Deploy**.

**Opção 2 — via CLI**
```bash
npm i -g vercel
vercel        # preview
vercel --prod # produção
```

## Dados

- Tudo é salvo no navegador onde você usa o site. Outro navegador ou computador começa vazio.
- Em **Ajustes**, use **Exportar backup** / **Importar backup** (JSON) para levar seus dados de um lugar para outro.
- O site vem com dados de exemplo. Em **Ajustes → Começar do zero**, você limpa tudo.
- Não guarde senhas nem números de documentos: o localStorage não tem criptografia.

## Atalhos

- `Ctrl/⌘ + K`: paleta de comandos (navegar, criar itens, abrir documentos, alternar tema)
- Arraste os cartões do kanban entre as colunas
- Clique nas barras de nível de uma tecnologia para mudar o nível direto no cartão

## Estrutura

```
src/
  App.jsx          layout, navegação (hash) e paleta de comandos
  store.jsx        estado global + persistência no localStorage
  seed.js          dados de exemplo
  ui.jsx           ícones, modal, formulários, componentes base
  charts.jsx       radar, barras mensais, ranking (SVG puro)
  pages/           Dashboard, Skills, Certs, Kanban, Finance, Docs, Habits, Settings
  styles.css       design tokens (tema claro/escuro) e estilos
```

## Próximos passos possíveis

- Sincronizar entre dispositivos com Supabase ou Firebase (login + banco).
- Proteger o acesso com senha via Vercel Authentication.
