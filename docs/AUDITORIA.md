# Auditoria do Treino App (v1.4 → v1.5)

Plano genérico de orientação: não é prescrição individual nem avaliação médica. O desconforto lombar relatado
(associado à cadeira) não foi tratado como diagnóstico; o app só evita sobrecarga e orienta parar se houver dor.

## A. Diagnóstico técnico (estado da v1.4)

| Item | Encontrado |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 7, sem Tailwind (CSS em `app/globals.css`) |
| Rotas | `/` Hoje, `/semana`, `/pomodoro`, `/exercicios`, `/exercicios/[id]` (SSG), `/progresso`, `/ajuda`, `manifest` |
| Estado | hook `useStore` + funções puras em `lib/domain` (MVVM leve: `lib/viewmodels/useTodayViewModel.ts`) |
| Persistência | `localStorage`, chave `treino-app:v1`, atrás de `lib/storage/repository.ts`. Sem banco, sem autenticação |
| Offline | service worker `public/sw.js` (rede primeiro para páginas, cache primeiro para `/_next/static`) |
| Dependências | só `next`, `react`, `react-dom` (+ tipos e TypeScript) |
| Testes | nenhum no repositório (havia scripts E2E fora do projeto) |
| Deploy | Vercel via CLI (projeto `treino-app`, sem integração Git, sem variáveis de ambiente) |
| Git | não havia repositório |

### Problemas confirmados no código

1. **Plano não correspondia ao objetivo**: 5 semanas, 4 corridas fixas (seg/qua/sex/dom) e semana escolhida à mão (`store.week`), sem relação com datas.
2. **Distâncias congeladas ao personalizar um dia**: `workoutEdit` salvava as seções inteiras por dia da semana; a corrida editada ficava com a distância daquela semana para sempre (o mesmo para "3 rodadas" na semana de descarga).
3. **Sem registro real da corrida**: o Progresso só tinha % de itens marcados; não havia distância, tempo, ritmo, esforço nem status (adiado/não realizado).
4. **% do dia inflado**: itens opcionais contavam no total e `done` podia ter mais chaves que `totals` (razão acima de 100%).
5. **Repetições no mesmo dia**: alongamento do flexor do quadril 2 vezes nos dias de corrida (pós-corrida + postura); agachamento e ponte no aquecimento e de novo no treino de força.

## B. Auditoria dos treinos

Critérios: objetivo (10 km em 8 semanas, 3–4 corridas/semana), recuperação, equilíbrio entre grupos, cuidado com a lombar.

### Corrida

| Treino (v1.4) | Decisão | Motivo |
|---|---|---|
| Plano de 5 semanas com semana escolhida à mão | **Substituir** | Trocado pelo plano de 8 semanas. Padrão (a pedido do usuário, fim de semana com menos tempo): segunda leve, quarta com variação, sexta longão, domingo trote leve curto opcional. Corridas principais com um dia de intervalo. |
| Longão de 10 km na semana 5 (40% do volume) | **Substituir** | Progressão do longão agora 6 → 7 → 7 → 6 → 8 → 8,5 → 9 → 10 km. |
| Semana 4 de descarga | **Manter** | Mantida (4/4/6 km). Semana 8 também reduz antes dos 10 km. |
| Só ritmo de conversa | **Ajustar** | Mantido como base; quinta ganha acelerações (sem. 1) e blocos moderados (6–7/10) com 2 min de trote leve entre eles. |

### Aquecimento da corrida

| Exercício | Decisão | Motivo |
|---|---|---|
| Caminhada rápida / trote, balanço frente-trás e lateral, afundo com rotação, agachamento (10), marcha alta, calcanhar no glúteo, círculos | **Manter** | Aquecimento dinâmico curto (5–8 min), adequado. |
| Acelerações leves (opcional) | **Remover** do aquecimento | Agora fazem parte do treino da quinta na semana 1 (4 × 20 s), evitando duplicar. |

### Alongamento pós-corrida e mobilidade

| Exercício | Decisão | Motivo |
|---|---|---|
| Panturrilha na parede, posterior de coxa, glúteo (figura 4), flexor do quadril | **Manter** | Curtos, sem dor, com cronômetro. |
| Mobilidade de sábado (alongamentos + tornozelo, gato-camelo, livro aberto) | **Manter** | Vai para o dia regenerativo (opcional). |

### Rotina de postura (todo dia)

| Exercício | Decisão | Motivo |
|---|---|---|
| Recuo de queixo, anjo na parede, extensão torácica, peitoral, gato-camelo, livro aberto, punhos | **Manter** | Baixa carga, focada em quem trabalha sentado. |
| Flexor do quadril | **Ajustar** | Fica fora da postura nos dias que já têm o alongamento pós-corrida (não repetir no mesmo dia). |

### Fortalecimento

| Exercício (v1.4: calistenia A/B, 3 rodadas, ter/qui) | Decisão | Motivo |
|---|---|---|
| Ponte de glúteo | **Manter** (2 × 12) | Glúteos estabilizam o quadril na passada; carga baixa para a lombar. |
| Agachamento livre | **Ajustar** (2 × 10) | Volume menor (era 3 × 12–15 + aquecimento) para conviver com 3 corridas. |
| Elevação de panturrilha | **Ajustar** (2 × 15) | Essencial para corredor; na v1.4 caía na véspera do longão (calistenia B na quinta). |
| Bird dog | **Manter** (2 × 8 por lado) | Estabilidade do tronco sem flexão da coluna. |
| Prancha lateral | **Ajustar**: entra no fortalecimento (2 × 20 s por lado) | Faltava estabilidade lateral de tronco e quadril no treino de força. |
| Prancha (noite) | **Manter** | 3 × 30 s, já existente. |
| Dead bug | **Manter** na calistenia A | Bom para a lombar; fica na opção completa. |
| Step-up | **Manter** na calistenia A | Útil, mas opcional (mais volume de pernas). |
| Stiff unilateral | **Substituir** no fortalecimento padrão | Flexão de quadril com carga na coluna; pela lombar, o padrão usa ponte + bird dog. Na calistenia A fica com aviso para trocar por ponte se incomodar. |
| Barra fixa, flexão, remada invertida, Y-T-W | **Manter** na calistenia B | Parte superior e postura; ficam na opção "calistenia completa". |
| Flexão fechada | **Remover** da calistenia B | Redundante com a flexão no mesmo treino. Continua na biblioteca. |
| Aquecimento de força com agachamento e ponte | **Ajustar** | Trocado por círculos de quadril/tornozelo e gato-camelo; a 1ª série dos exercícios serve de aquecimento. |

Distribuição padrão (configurável): **seg** corrida leve · **ter** fortalecimento · **qua** corrida com variação · **qui** fortalecimento ·
**sex** longão · **sáb** livre · **dom** trote leve curto opcional. O longão saiu do fim de semana porque o usuário tem menos tempo
no sábado e no domingo. Compromisso: o fortalecimento de quinta fica na véspera do longão (o app avisa); a sessão é curta (2 séries,
peso do corpo). Se as pernas chegarem pesadas no longão, mova essa sessão para outro dia em "Configurar plano".
A calistenia completa A/B continua disponível em "Configurar plano".

Nenhum exercício foi apagado da biblioteca: todos continuam em Exercícios e podem ser adicionados em "Editar treino".

## C. Modelo de dados (migração não destrutiva)

Novos campos no mesmo `treino-app:v1`:

- `run` (configuração): `startDate` (segunda da semana 1), `days`, `availableDays`, `strengthPref`, `currentKm`, `best5k`, `goalKm`, `easyPace`, `decisions` (por semana do calendário: `next`, `repeat`, `pause`).
- `runLogs` (registros): id estável `plano-10k:c<semana do calendário>:<easy|tempo|long|regen>`, `planWeek`, `scheduled`, `plannedKm`, `status` (`pendente`, `concluido`, `adiado`, `nao_realizado`), `movedTo`, `km`, `seconds`, `rpe` (1–10), `discomfort`, `notes`, `updatedAt`.
- `dayStats`: feitos/total por dia (base do mapa do Progresso).
- `overrides` passa a usar chave por papel do dia (`r:easy`, `r:strength1`...). As chaves antigas `"0"`–`"6"` ficam guardadas (não são apagadas), mas não se aplicam ao novo calendário.
- `week` e `totals` ficam como legado (dados antigos continuam lidos).

Regras: semanas não avançam sozinhas (o usuário confirma avançar, repetir ou pausar; o app sugere repetir se a semana anterior teve menos de 2 corridas ou ficou sem longão). Ao registrar um treino, as decisões até aquela semana ficam fixas para o histórico não mudar. Nada aumenta para compensar treino perdido.
