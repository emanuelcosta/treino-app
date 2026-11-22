import Link from 'next/link';

export const metadata = { title: 'Como usar | Treino' };

const steps: [string, string][] = [
  ['Veja o treino do dia', 'Na aba Hoje aparece o treino de hoje, dividido em blocos: aquecimento, treino, alongamento, postura e prancha. Use as abas Seg a Dom para espiar os outros dias e o seletor "Semana do plano" para avançar nas 5 semanas.'],
  ['Aprenda cada exercício', 'Toque em "Como fazer + vídeo". Você vê o passo a passo numerado, o cuidado principal, como facilitar ou evoluir e os vídeos. Toque na miniatura para assistir sem sair do app.'],
  ['Faça no modo guiado', 'Toque em "Iniciar treino guiado". O app mostra um exercício por vez, com instruções e vídeo. Ao concluir um exercício de força, começa um descanso de 45 s (você pode somar 15 s ou pular).'],
  ['Marque o que fez', 'Toque no círculo de cada item, ou use "Marcar dia como feito" para marcar tudo de uma vez. Nos treinos de força, anote as repetições no campo de anotação para acompanhar a evolução.'],
  ['Mude o treino do seu jeito', 'Toque em "Editar treino". Você pode alterar séries e repetições, subir ou descer exercícios, remover, adicionar da biblioteca, criar um exercício seu (com seus passos e link de vídeo) ou adicionar um item livre. "Restaurar padrão" volta o dia ao original.'],
  ['Acompanhe o progresso', 'Na aba Progresso você vê os últimos 28 dias, quantos dias concluiu e sua sequência. Tudo fica salvo só neste aparelho.'],
  ['Siga o plano de 10 km', 'São 8 semanas: corrida leve (terça), corrida com variação (quinta), longão (domingo) e regenerativo opcional (sábado), com 2 sessões de fortalecimento. Na tela Semana você muda os dias, o início e o ritmo leve. A cada semana nova, você confirma se avança, repete ou pausa: nada avança sozinho.'],
  ['Registre a corrida', 'No card da corrida, escolha Concluído, Adiado ou Não realizado. Em Concluído, informe distância, tempo (o ritmo é calculado), esforço de 1 a 10 e se teve dor. Adiado leva o treino para outro dia, sem duplicar. O Progresso usa só o que você registrou.'],
  ['Use o cronômetro', 'Nos alongamentos, na prancha e na caminhada aparece o botão "Cronômetro". O app dá 5 s para você se posicionar, conta o tempo certo de cada série e de cada lado, avisa "troque de perna" e bipa nos 3 últimos segundos. Ao terminar, o item é marcado. Você muda os segundos em "Editar treino".'],
  ['Corra com o pomodoro', 'Na aba Pomodoro você corre em blocos: o padrão é 5 min correndo, pausa curta de 1 min 30 s caminhando e, a cada 4 blocos, pausa longa de 3 min. Mude os tempos como quiser, toque em Iniciar e guarde o celular: o app avisa com som, voz e vibração a cada troca.'],
  ['Use sem internet', 'Depois de abrir o app uma vez com internet, ele fica guardado no navegador e abre mesmo offline (na pista, no parque). Você continua marcando e anotando normalmente. Só os vídeos precisam de internet. Dica: no celular, use "Adicionar à tela inicial" para abrir como um app.'],
];

const gloss: [string, string][] = [
  ['Ritmo de conversa', 'Você consegue falar frases inteiras enquanto corre, sem ofegar. Se não consegue, diminua o ritmo.'],
  ['Longão', 'A corrida mais longa da semana (sexta). É a mais importante: se estiver muito cansado, encurte em vez de pular.'],
  ['Semana de descarga', 'Semana mais leve (a 4) para o corpo absorver o treino e você chegar mais forte à semana 5.'],
  ['Rodada', 'Uma passada por todos os exercícios do bloco. "3 rodadas" = repetir a sequência 3 vezes.'],
  ['Repetição e série', 'Repetição é um movimento completo. Série é um grupo de repetições seguidas. "3 x 10" = 3 séries de 10 repetições.'],
  ['Negativa', 'Na barra fixa: você sobe com ajuda (pulando ou num degrau) e desce bem devagar, em 4 a 5 segundos. Constrói a força para a barra completa.'],
  ['Aquecimento dinâmico', 'Movimentos leves e contínuos antes de correr, que preparam músculos e articulações. Alongamento parado fica para depois.'],
  ['Esforço percebido (1 a 10)', 'Quanto o treino pareceu difícil: 1 é muito fácil e 10 é o máximo. Corrida leve fica perto de 3 a 4; os blocos moderados, de 6 a 7.'],
  ['Pomodoro', 'Treino em blocos: um tempo de esforço (correr) e uma pausa (caminhar), repetidos. Depois de alguns blocos vem uma pausa mais longa. Ajuda a correr mais tempo sem cansar demais.'],
  ['Boa forma', 'Fazer o movimento completo e controlado, sem dor aguda. É melhor fazer menos repetições bem feitas do que muitas mal feitas.'],
];

export default function Page() {
  return (
    <>
      <Link href="/" className="back">← Voltar para Hoje</Link>
      <h1>Como usar o app</h1>
      <p className="muted">Passo a passo para aprender e treinar com segurança.</p>

      <section className="card">
        <h2>Passo a passo</h2>
        <ol className="steps big">
          {steps.map(([t, d]) => (<li key={t}><b>{t}.</b> {d}</li>))}
        </ol>
      </section>

      <section className="card">
        <h2>Segurança</h2>
        <ul className="bul">
          <li>Faça o eletrocardiograma e o ecocardiograma com um cardiologista ou médico do esporte. Até lá, mantenha ritmo de conversa e não aumente a carga.</li>
          <li>Pare e procure atendimento se sentir dor ou aperto no peito, tontura forte, desmaio, palpitação fora do normal ou falta de ar desproporcional.</li>
          <li>Dor muscular leve no dia seguinte é normal. Dor aguda ou que passe de 2 a 3 dias: repita a semana anterior e, se persistir, procure um profissional.</li>
          <li>O app é orientação geral e não substitui médico ou profissional de educação física.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Glossário</h2>
        <dl className="gloss">
          {gloss.map(([t, d]) => (<div key={t}><dt>{t}</dt><dd>{d}</dd></div>))}
        </dl>
      </section>
    </>
  );
}
