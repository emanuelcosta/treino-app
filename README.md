# Treino: corrida, força e postura

App em Next.js (App Router, TypeScript) com a rotina diária de treino, vídeo em cada exercício, treino guiado passo a passo, edição de treinos e acompanhamento de progresso.

## Rodar
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```
Deploy simples: Vercel (sem variáveis de ambiente).

## Dados (versão 1)
Tudo é salvo na memória do navegador (`localStorage`, chave `treino-app:v1`). Não há servidor nem banco de dados na nuvem. Para não perder dados ao trocar de aparelho ou limpar o navegador, use Progresso > Exportar backup / Importar backup.

## Offline (cache do navegador)
Depois da primeira visita com internet, o service worker (`public/sw.js`) guarda páginas e arquivos no cache do navegador e o app abre sem internet. Só funciona no build de produção (`npm run build && npm start`) ou em HTTPS (Vercel); no `npm run dev` fica desligado. Para forçar todos a baixarem de novo, aumente `VERSION` em `public/sw.js`. Vídeos do YouTube precisam de internet.

## Funcionalidades
- **Hoje**: treino do dia (Seg a Dom), semana do plano (1 a 5), checklist, anotações, cronômetro de descanso, "Marcar dia como feito".
- **Treino guiado**: um exercício por vez com passo a passo, vídeo e descanso automático.
- **Editar treino**: alterar repetições, reordenar, remover, adicionar da biblioteca, criar exercício próprio (passos + link do YouTube), item livre, restaurar padrão.
- **Exercícios**: biblioteca com busca, passo a passo numerado e vídeos.
- **Cronômetro**: nos exercícios de tempo (alongamentos, prancha, caminhada) o app conta os segundos de cada série e de cada lado, com bipes, voz e vibração.
- **Pomodoro**: corrida/caminhada em blocos (padrão: 5 min correndo, pausa curta de 1 min 30 s, pausa longa de 3 min a cada 4 blocos), tudo configurável.
- **Semana**, **Progresso** (28 dias, sequência, backup) e **Como usar** (guia e glossário).

## Estrutura
- `lib/data.ts`: exercícios, rotinas por dia e plano de corrida (edite aqui o treino padrão).
- `lib/domain/`: regras puras (dia, edição do treino, progresso, backup), sem React.
- `lib/illustrations/`: ilustrações passo a passo (poses do boneco por exercício em `poses.ts`); desenho em `components/Figure.tsx`.
- `lib/storage/repository.ts`: onde os dados são salvos (hoje `localStorage`; troque aqui para usar nuvem).
- `lib/useStore.ts`: hook React que carrega e salva pelo repositório.
- `lib/viewmodels/useTodayViewModel.ts`: estado e ações da tela Hoje (a tela `components/Today.tsx` só desenha).
- `components/`: telas e componentes. `app/`: rotas.

Orientação geral. Não substitui avaliação de médico ou profissional de educação física.
