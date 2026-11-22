# Integração com o Strava

Importa distância e tempo das corridas gravadas no Strava para os registros do plano. Só leitura, só das suas
atividades. Nada é aplicado sozinho: o app sugere e você confirma. Cada atividade só pode ir para um treino.

## Como funciona

- Rotas no próprio app (funções da Vercel, sem servidor ou banco extra): `/api/strava/login`, `/callback`, `/status`,
  `/activities`, `/logout`.
- O login usa OAuth do Strava com `state` aleatório (proteção contra CSRF) e pede o escopo `read,activity:read_all`.
- Os tokens ficam **só num cookie httpOnly criptografado** (AES-256-GCM, chave derivada do `STRAVA_CLIENT_SECRET`),
  restrito a `/api/strava`. O navegador não consegue ler; o servidor não guarda nada.
- O token do Strava expira a cada 6 horas e é renovado automaticamente quando você busca atividades.
- O app só recebe os campos necessários: nome, tipo, data local, distância, tempo em movimento e tempo total.
  Pedal e outros esportes são ignorados.
- O service worker nunca guarda respostas de `/api/` em cache.
- "Desconectar" revoga o acesso no Strava e apaga o cookie. Os registros já importados continuam no app.

## Ativar (uma vez)

1. Entre em https://www.strava.com/settings/api com a sua conta e crie o app de API:
   - **Application Name**: Treino (qualquer nome)
   - **Category**: Training
   - **Website**: `https://treino-app-delta-gold.vercel.app`
   - **Authorization Callback Domain**: `treino-app-delta-gold.vercel.app` (sem `https://` e sem barra)
2. Copie o **Client ID** e o **Client Secret** (o secret é uma senha: não compartilhe nem coloque no código).
3. Cadastre os dois na Vercel, no projeto `treino-app`, ambiente **Production**. Pelo painel
   (Settings > Environment Variables) ou pelo terminal, dentro da pasta do projeto:
   ```bash
   npx vercel env add STRAVA_CLIENT_ID production
   npx vercel env add STRAVA_CLIENT_SECRET production
   ```
   (o comando pede o valor; cole quando perguntar)
4. Publique de novo para as variáveis valerem:
   ```bash
   npx vercel deploy --prod
   ```
5. No app: **Semana > Strava > Conectar com Strava** e autorize.

Sem essas variáveis o app funciona normalmente e mostra "integração ainda não está ativa".

## Limites e regras do Strava

- Gratuito para uso pessoal. Apps novos atendem só o próprio dono até passar por revisão, o que basta aqui.
- Há limite de chamadas a cada 15 minutos e por dia; o app só consulta quando você toca em "Buscar" ou "Importar".
  Se o limite for atingido, aparece uma mensagem para tentar de novo depois.
- Os dados do Strava só aparecem para você e não são usados para treinar IA (regras do Strava).
- Para testar localmente: crie um segundo app no Strava com o domínio `localhost` e rode com
  `STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... npm run dev`.

## Testes

- `npm test`: criptografia da sessão (cookie alterado ou de outra chave é recusado), conversão das atividades,
  sugestões e bloqueio de duplicidade.
- `npm run test:e2e` (`tests/e2e/strava.test.cjs`): sem chaves, com chaves **falsas** de teste numa segunda porta
  (`STRAVA_CLIENT_ID=12345 STRAVA_CLIENT_SECRET=segredo-de-teste-local npm start -- -p 3101`) e telas com a API do
  Strava simulada. Nenhum teste chama o Strava de verdade.
