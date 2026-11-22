# Treino: corrida, força e postura

App em Next.js (App Router, TypeScript) com plano de corrida de 5 km para 10 km em 8 semanas, registro das corridas, fortalecimento, rotina de postura, vídeo e ilustração em cada exercício, treino guiado, cronômetros e acompanhamento de progresso.

Publicado em https://treino-app-delta-gold.vercel.app

## Rodar
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Verificar
```bash
npm run typecheck  # TypeScript estrito (inclui variáveis e imports sem uso)
npm test           # testes das regras (node --test, sem biblioteca extra)
npm run build && npm start -- -p 3100   # em outro terminal:
npm run test:e2e   # testes no navegador (usa o Chrome instalado via playwright-core)
```
`BASE=https://...` em `npm run test:e2e` testa outro endereço.

## Publicar (Vercel)
O projeto `treino-app` está ligado pela CLI da Vercel (pasta `.vercel/`, fora do Git). Variáveis de ambiente só para o Strava (opcional, veja `.env.example`).
```bash
npx vercel deploy          # prévia
npx vercel deploy --prod   # produção
```

## Strava (opcional)
Importa distância e tempo das corridas do Strava (só leitura, você confirma cada importação). Para ativar, crie o app em strava.com/settings/api e cadastre `STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET` na Vercel: passo a passo em `docs/STRAVA.md`. Sem elas, o resto do app funciona normalmente.

## Dados
Tudo fica no navegador (`localStorage`, chave `treino-app:v1`): sem servidor, sem conta. Para não perder dados ao trocar de aparelho ou limpar o navegador, use Progresso > Exportar backup / Importar backup. Dados de versões anteriores são lidos e completados sem apagar nada (veja `docs/AUDITORIA.md`).

## Offline
Depois da primeira visita, o service worker (`public/sw.js`) guarda o app no navegador e ele abre sem internet (só no build de produção ou em HTTPS). Para forçar todos a baixarem de novo, aumente `VERSION` em `public/sw.js`. Vídeos precisam de internet.

## Funcionalidades
- **Hoje**: treino do dia (rotina pelo papel do dia no plano), corrida com distância, intensidade, duração estimada e objetivo; registro de status (concluído, adiado, não realizado), distância, tempo, ritmo calculado, esforço (1 a 10), desconforto e observações. Nada é marcado sozinho. Confirmação de semana nova (avançar, repetir ou pausar).
- **Semana**: calendário com navegação, km planejado x realizado, corridas concluídas, decisão da semana, registro de treinos passados, tabela das 8 semanas e configuração (dias, início, ritmo leve, fortalecimento).
- **Progresso**: rumo aos 10 km, km por semana, longões, ritmo médio, tempo, consistência (planejado em azul, realizado em laranja) e o mapa dos exercícios do dia.
- **Exercícios**: biblioteca com busca, passo a passo, ilustrações, vídeos e o fortalecimento para corrida.
- **Pomodoro**: corrida/caminhada em blocos e modelo opcional de pausas para quem trabalha sentado.
- **Treino guiado**, **Editar treino**, **Cronômetro** nos exercícios de tempo e **Como usar**.

## Estrutura
- `lib/data.ts`: exercícios, plano de 8 semanas e rotinas por papel do dia.
- `lib/domain/`: regras puras, sem React: `runPlan.ts` (plano, calendário, registros, resumos, segurança), `day.ts`, `workoutEdit.ts`, `store.ts` (modelo e migração), `timer.ts`, `progress.ts`, `dates.ts`.
- `lib/storage/repository.ts`: onde os dados são salvos (hoje `localStorage`).
- `lib/viewmodels/useTodayViewModel.ts`: estado e ações da tela Hoje.
- `components/`: telas e componentes (`RunWorkoutCard`, `PlanSettingsForm`, `RunProgress`...). `app/`: rotas.
- `tests/unit` (regras) e `tests/e2e` (navegador). `docs/AUDITORIA.md`: diagnóstico e auditoria dos treinos.

Orientação geral. Não substitui avaliação de médico ou profissional de educação física.
