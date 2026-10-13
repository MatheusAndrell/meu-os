# Meu OS — painel pessoal

Painel pessoal para organizar tecnologias e níveis, certificações, tarefas (kanban), finanças, documentos e hábitos.

Feito com **React 18 + Vite**, sem backend. Os dados ficam salvos no navegador (localStorage).

Visual "caderno de bordo": papel e tinta, um laranja de sinalização, Archivo (larga) + IBM Plex Mono. As fontes vêm do próprio projeto (Fontsource), sem depender do Google Fonts.

## Rotas

URLs limpas com History API: `/`, `/stack`, `/certificacoes`, `/tarefas`, `/financas`, `/documentos`, `/habitos`, `/ajustes`.
O `vercel.json` tem um *rewrite* para `index.html`, assim recarregar ou abrir `/stack` direto funciona. Links antigos no formato `/#/stack` são convertidos automaticamente.

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
  App.jsx          cabeçalho, índice de seções e paleta de comandos
  router.jsx       roteador (History API) e <Link>
  store.jsx        estado global + persistência no localStorage
  seed.js          dados de exemplo
  ui.jsx           ícones, modal, formulários, componentes base
  charts.jsx       barras mensais e ranking (SVG puro)
  pages/           Dashboard, Skills, Certs, Kanban, Finance, Docs, Habits, Settings
  styles.css       tokens de design (modo papel / modo tinta) e estilos
```

## Próximos passos possíveis

- Sincronizar entre dispositivos com Supabase ou Firebase (login + banco).
- Proteger o acesso com senha via Vercel Authentication.
