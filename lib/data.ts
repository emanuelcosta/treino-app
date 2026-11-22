export type Video = { id: string; title: string };
export type Group = 'Força' | 'Core' | 'Aquecimento' | 'Alongamento e mobilidade' | 'Postura';
export type Exercise = {
  id: string;
  name: string;
  group: Group;
  muscles: string;
  how: string;
  mistake?: string;
  easier?: string;
  harder?: string;
  videos: Video[];
  query: string;
  steps?: string[];
  custom?: boolean;
};

const v = (id: string, title: string): Video => ({ id, title });

const list: Exercise[] = [
  // ---------- Força ----------
  {
    id: 'agachamento', name: 'Agachamento livre', group: 'Força', muscles: 'Quadríceps e glúteo',
    how: 'Pés na largura dos ombros. Desça como se fosse sentar numa cadeira, peito aberto e joelhos na direção dos pés, até as coxas ficarem paralelas ao chão. Suba empurrando o chão.',
    mistake: 'Joelhos para dentro; calcanhar saindo do chão.',
    easier: 'Agachar até uma cadeira.',
    harder: 'Descer em 3 s, pausa de 2 s embaixo, agachamento búlgaro.',
    videos: [v('CaTbpJH49i4', 'Agachamento livre passo a passo (iniciantes)')],
    query: 'agachamento livre como fazer',
  },
  {
    id: 'step-up', name: 'Step-up (subida em degrau)', group: 'Força', muscles: 'Quadríceps, glúteo e equilíbrio',
    how: 'Apoie o pé inteiro em um degrau firme (altura do joelho ou menos). Suba só com a perna de cima e desça devagar.',
    mistake: 'Impulsionar com a perna de baixo.',
    easier: 'Degrau mais baixo.',
    harder: 'Degrau mais alto ou mochila com peso.',
    videos: [v('Hdv4JPeFqJU', 'Step up (short)')],
    query: 'step up exercício como fazer',
  },
  {
    id: 'stiff-unilateral', name: 'Stiff unilateral', group: 'Força', muscles: 'Posterior de coxa, glúteo e equilíbrio',
    how: 'Em pé numa perna, joelho levemente dobrado. Incline o tronco à frente levando a outra perna para trás, costas retas, até sentir a parte de trás da coxa. Volte apertando o glúteo.',
    mistake: 'Arredondar as costas; girar o quadril.',
    easier: 'Mão na parede, ponta do outro pé no chão.',
    harder: 'Segurar uma mochila.',
    videos: [v('DVO_L6mOAdU', 'Stiff unipodal (aviãozinho)')],
    query: 'stiff unilateral peso corporal como fazer',
  },
  {
    id: 'ponte-gluteo', name: 'Ponte de glúteo', group: 'Força', muscles: 'Glúteo e posterior de coxa',
    how: 'Deitado, joelhos dobrados e pés no chão. Suba o quadril até formar uma linha do ombro ao joelho e aperte o glúteo por 1 s. Desça devagar.',
    mistake: 'Arquear a lombar em vez de usar o glúteo.',
    easier: 'Subir menos e segurar menos tempo.',
    harder: 'Pés elevados numa cadeira ou uma perna só.',
    videos: [v('-Nzmu7H881I', 'Exercícios de ponte, passo a passo'), v('6jS6aH-78w4', 'Glute bridge')],
    query: 'ponte de glúteo como fazer',
  },
  {
    id: 'panturrilha', name: 'Elevação de panturrilha', group: 'Força', muscles: 'Panturrilha e tendão de Aquiles',
    how: 'Na borda de um degrau, calcanhares para fora. Suba o máximo, segure 1 s e desça alongando em 3 s.',
    mistake: 'Movimento curto e rápido.',
    easier: 'Com a mão apoiada na parede.',
    harder: 'Uma perna só.',
    videos: [v('fymX9oQ8IRM', 'Panturrilha com peso corporal'), v('h4k8z-8ODKA', 'Panturrilha em pé')],
    query: 'elevação de panturrilha peso corporal',
  },
  {
    id: 'barra-fixa', name: 'Barra fixa e negativas', group: 'Força', muscles: 'Costas e braços',
    how: 'Pegada com as palmas para frente, um pouco mais larga que os ombros. Puxe até o queixo passar da barra. Na negativa, suba com ajuda (pulo ou degrau) e desça em 4 a 5 s.',
    mistake: 'Balançar o corpo; descer solto.',
    easier: 'Só negativas.',
    harder: 'Pausa de 2 s no alto, depois com peso.',
    videos: [v('r1v7PxcZbaY', 'Tutorial da barra negativa'), v('AXvU8AIIWzc', 'Sua primeira barra fixa')],
    query: 'barra fixa negativa iniciante',
  },
  {
    id: 'flexao', name: 'Flexão de braço', group: 'Força', muscles: 'Peito, ombros e tríceps',
    how: 'Mãos um pouco mais largas que os ombros, corpo em linha reta (glúteo e abdômen contraídos). Desça até o peito quase tocar o chão, cotovelos a cerca de 45° do tronco, e suba.',
    mistake: 'Quadril caindo; cotovelos muito abertos.',
    easier: 'Mãos numa mesa ou parede, ou joelhos no chão.',
    harder: 'Pés elevados, descida lenta.',
    videos: [v('Azw6BZ8-wSM', 'Como fazer flexão de braço'), v('aADXVpWpNe0', 'Progressão da flexão de braço')],
    query: 'flexão de braço como fazer',
  },
  {
    id: 'flexao-fechada', name: 'Flexão fechada', group: 'Força', muscles: 'Tríceps e peito',
    how: 'Igual à flexão, mas com as mãos sob o peito, na largura dos ombros, e cotovelos rente ao corpo.',
    mistake: 'Cotovelos abrindo.',
    easier: 'Joelhos no chão ou mãos elevadas.',
    harder: 'Pés elevados.',
    videos: [v('WFAwvX8dA9U', 'Flexão fechada (aprenda a fazer)')],
    query: 'flexão fechada como fazer',
  },
  {
    id: 'remada-invertida', name: 'Remada invertida', group: 'Força', muscles: 'Costas e ombros',
    how: 'Deitado sob uma mesa firme (ou barra baixa), segure a borda com as mãos um pouco mais largas que os ombros. Corpo em linha reta, puxe o peito até a borda juntando as escápulas e desça controlando.',
    mistake: 'Quadril caindo; encolher os ombros.',
    easier: 'Joelhos dobrados e pés no chão.',
    harder: 'Pernas esticadas, pés elevados.',
    videos: [v('4-2JmXK9rtk', 'Remada invertida na mesa (joelhos estendidos)'), v('Mb9PD3vIkjg', 'Remada inversa na mesa')],
    query: 'remada invertida na mesa em casa',
  },
  {
    id: 'y-t-w', name: 'Y-T-W', group: 'Postura', muscles: 'Parte alta das costas e escápulas',
    how: 'De bruços, testa numa toalha dobrada. Com os polegares para cima, levante os braços em Y (acima da cabeça), depois T (abertos) e W (cotovelos dobrados), apertando as escápulas.',
    mistake: 'Levantar o pescoço; arquear a lombar.',
    easier: 'Só a posição T.',
    harder: 'Segurar 2 s no alto.',
    videos: [v('6hvE4sLULzI', 'Escápulas: exercícios W e Y'), v('A0FzBIoqppg', 'How to do YTW (inglês)')],
    query: 'Y T W exercício escápulas',
  },
  // ---------- Core ----------
  {
    id: 'dead-bug', name: 'Dead bug', group: 'Core', muscles: 'Core profundo',
    how: 'Deitado de costas, braços para cima e joelhos a 90°. Com a lombar colada no chão, estique braço e perna opostos devagar, volte e alterne.',
    mistake: 'Lombar descolando do chão.',
    easier: 'Mexer só as pernas.',
    harder: 'Movimento mais lento e amplo.',
    videos: [v('oV1_T-5ksj8', 'Dead bug e bird dog (inglês)')],
    query: 'dead bug exercício como fazer',
  },
  {
    id: 'bird-dog', name: 'Bird dog', group: 'Core', muscles: 'Core e coluna estáveis',
    how: 'Em quatro apoios, mãos sob os ombros e joelhos sob o quadril. Estique um braço à frente e a perna oposta para trás sem girar o quadril, segure 2 s e alterne.',
    mistake: 'Arquear a lombar; quadril girando.',
    easier: 'Levantar só o braço ou só a perna.',
    harder: 'Segurar 5 s.',
    videos: [v('oV1_T-5ksj8', 'Dead bug e bird dog (inglês)')],
    query: 'bird dog exercício como fazer',
  },
  {
    id: 'prancha-lateral', name: 'Prancha lateral', group: 'Core', muscles: 'Core lateral e quadril',
    how: 'De lado, antebraço no chão com o cotovelo sob o ombro. Suba o quadril até o corpo formar uma linha reta e segure.',
    mistake: 'Quadril caindo.',
    easier: 'Joelhos apoiados.',
    harder: 'Elevar a perna de cima.',
    videos: [v('UnS0SsjOGw4', 'Prancha lateral do jeito correto'), v('HMaz412vUCg', 'Prancha lateral: progressões')],
    query: 'prancha lateral como fazer',
  },
  {
    id: 'prancha', name: 'Prancha', group: 'Core', muscles: 'Core',
    how: 'Antebraços no chão com os cotovelos sob os ombros, corpo em linha reta da cabeça aos calcanhares, glúteo e abdômen contraídos. Respire normalmente.',
    mistake: 'Quadril caindo ou subindo demais.',
    easier: 'Joelhos apoiados.',
    harder: 'Aumentar o tempo (30, 40, 45 s) antes de aumentar as séries.',
    videos: [v('RTxAFDK1OMw', 'Prancha frontal e lateral: execução correta')],
    query: 'prancha abdominal como fazer',
  },
  // ---------- Aquecimento ----------
  {
    id: 'aquec-forca', name: 'Círculos de punhos e braços', group: 'Aquecimento', muscles: 'Punhos e ombros',
    how: 'Gire os punhos 10 vezes para cada lado. Depois faça círculos de braços: 10 para frente e 10 para trás, aumentando o tamanho do círculo aos poucos.',
    videos: [], query: 'aquecimento punhos e ombros antes do treino',
  },
  {
    id: 'caminhada-rapida', name: 'Caminhada rápida ou trote leve', group: 'Aquecimento', muscles: 'Corpo todo',
    how: 'Comece devagar e aumente o ritmo aos poucos, por 2 a 3 minutos. Em dia frio ou com o corpo duro, acrescente mais 2 a 3 minutos.',
    videos: [v('ovzB5PFva_4', 'Como fazer aquecimento para corrida'), v('EA_lPFsPW4c', 'Melhores exercícios de aquecimento para corrida')],
    query: 'aquecimento dinâmico para corrida',
  },
  {
    id: 'balanco-frente-tras', name: 'Balanço de perna (frente e trás)', group: 'Aquecimento', muscles: 'Quadril e posterior de coxa',
    how: 'Apoie a mão numa parede e balance a perna solta para frente e para trás, controlando o movimento, sem arquear a lombar.',
    videos: [v('8dIHS_UVfQ4', 'Aquecimento dinâmico para corredores: leg swings e skips (inglês)')],
    query: 'balanço de perna aquecimento corrida leg swing',
  },
  {
    id: 'balanco-lateral', name: 'Balanço de perna (lateral)', group: 'Aquecimento', muscles: 'Quadril e adutores',
    how: 'De frente para a parede, balance a perna de um lado ao outro, na frente do corpo, com controle.',
    videos: [v('8dIHS_UVfQ4', 'Aquecimento dinâmico para corredores: leg swings e skips (inglês)')],
    query: 'balanço lateral de perna aquecimento leg swing lateral',
  },
  {
    id: 'afundo-rotacao', name: 'Afundo caminhando com rotação', group: 'Aquecimento', muscles: 'Quadril, coxas e tronco',
    how: 'Dê um passo longo à frente e desça em afundo. Gire o tronco para o lado da perna da frente e siga com a outra perna.',
    videos: [], query: 'afundo caminhando com rotação de tronco aquecimento',
  },
  {
    id: 'marcha-alta', name: 'Marcha alta (skipping)', group: 'Aquecimento', muscles: 'Flexores do quadril e coordenação',
    how: 'Eleve o joelho à frente com ritmo, braços opostos balançando, apoiando na ponta do pé.',
    videos: [v('Ik5MILiCRk4', 'Variações de educativos: skipping')],
    query: 'skipping educativo de corrida como fazer',
  },
  {
    id: 'calcanhar-gluteo', name: 'Calcanhar no glúteo', group: 'Aquecimento', muscles: 'Posterior de coxa',
    how: 'Trote curto levando os calcanhares em direção ao glúteo, tronco ereto.',
    videos: [], query: 'educativo de corrida calcanhar no glúteo',
  },
  {
    id: 'circulos-quadril-tornozelo', name: 'Círculos de tornozelo e quadril', group: 'Aquecimento', muscles: 'Tornozelos e quadril',
    how: 'Em pé, gire cada tornozelo e depois faça círculos amplos com o quadril, 8 a 10 para cada lado.',
    videos: [], query: 'mobilidade de tornozelo e quadril aquecimento',
  },
  // ---------- Alongamento e mobilidade ----------
  {
    id: 'along-panturrilha', name: 'Alongamento de panturrilha na parede', group: 'Alongamento e mobilidade', muscles: 'Panturrilha',
    how: 'Pé de trás com o calcanhar no chão, tronco inclinado à frente, mãos na parede. Segure 30 s por perna, sem dor.',
    videos: [v('l_OE_Fr0Oio', 'Alongamento de panturrilha')], query: 'alongamento de panturrilha na parede',
  },
  {
    id: 'along-posterior', name: 'Alongamento de posterior de coxa', group: 'Alongamento e mobilidade', muscles: 'Posterior de coxa',
    how: 'Perna esticada à frente apoiada num degrau, incline o tronco com as costas retas. Segure 30 s por perna.',
    videos: [v('AOTNa6WtWbU', '7 alongamentos para pernas e glúteos')], query: 'alongamento posterior de coxa',
  },
  {
    id: 'along-gluteo', name: 'Alongamento de glúteo (figura 4)', group: 'Alongamento e mobilidade', muscles: 'Glúteo e piriforme',
    how: 'Deitado, tornozelo sobre o joelho oposto, puxe a coxa em direção ao peito. Segure 30 s por lado.',
    videos: [v('6i3mofFeWoE', 'Alongamento de glúteos e pernas')], query: 'alongamento de glúteo figura 4',
  },
  {
    id: 'along-flexor-quadril', name: 'Alongamento do flexor do quadril', group: 'Alongamento e mobilidade', muscles: 'Flexores do quadril',
    how: 'Ajoelhado numa perna (toalha sob o joelho) e a outra à frente. Aperte o glúteo e leve o quadril levemente à frente. Segure 30 a 40 s por lado.',
    mistake: 'Arquear a lombar.',
    videos: [v('2vtqWK1IHls', 'Alongamento dos flexores do quadril sem dor na coluna'), v('LkEC8QO0ITk', 'Alongamento do flexor do quadril')],
    query: 'alongamento flexor do quadril',
  },
  {
    id: 'mob-tornozelo', name: 'Mobilidade de tornozelo', group: 'Alongamento e mobilidade', muscles: 'Tornozelo',
    how: 'De frente para a parede, leve o joelho em direção a ela sem tirar o calcanhar do chão. 10 repetições por perna.',
    videos: [], query: 'mobilidade de tornozelo joelho na parede',
  },
  {
    id: 'gato-camelo', name: 'Gato-camelo', group: 'Alongamento e mobilidade', muscles: 'Coluna',
    how: 'Em quatro apoios, arredonde as costas e depois afunde suavemente, alternando devagar. 8 a 10 repetições.',
    videos: [v('YuzoxlVanHw', 'Gato/camelo (mobilidade torácica)'), v('lY4YVOtMZrQ', 'O exercício do gato correto')],
    query: 'gato camelo mobilidade de coluna',
  },
  {
    id: 'livro-aberto', name: 'Livro aberto', group: 'Alongamento e mobilidade', muscles: 'Coluna torácica',
    how: 'Deitado de lado, joelhos dobrados. Abra o braço de cima como a página de um livro, acompanhando com o olhar. 8 repetições por lado.',
    videos: [v('REpqRDCFVgg', 'Mobilidade de coluna com livro aberto')], query: 'livro aberto mobilidade torácica',
  },
  // ---------- Postura ----------
  {
    id: 'recuo-queixo', name: 'Recuo de queixo', group: 'Postura', muscles: 'Pescoço (flexores profundos)',
    how: 'Sentado, olhando à frente, leve o queixo para trás (como fazer "papada") sem inclinar a cabeça. Segure 3 s. 10 repetições.',
    videos: [v('Z2klmiodDHA', 'How to do a neck retraction exercise (inglês)'), v('jCMjpUoAy70', 'Postura do queixo e pescoço')],
    query: 'recuo de queixo exercício postura',
  },
  {
    id: 'anjo-parede', name: 'Anjo na parede', group: 'Postura', muscles: 'Escápulas e peitoral',
    how: 'Costas, cabeça e glúteo na parede, braços em W com cotovelos e costas das mãos tocando a parede. Deslize os braços até Y sem descolar as costas. 8 a 10 repetições.',
    mistake: 'Arquear a lombar ou descolar as costas da parede.',
    videos: [v('Pb5QAHnq3CE', 'Anjos na parede (Wall Angels)')], query: 'anjo na parede exercício postura',
  },
  {
    id: 'ext-toracica', name: 'Extensão torácica na cadeira', group: 'Postura', muscles: 'Coluna torácica',
    how: 'Sentado, mãos atrás da cabeça, apoie a parte média das costas na borda do encosto e incline para trás suavemente, olhando para cima. Só a parte média, não a lombar. 8 a 10 repetições.',
    videos: [v('TX_BvzAXFTo', '13 exercícios para quem trabalha sentado')], query: 'extensão torácica na cadeira exercício',
  },
  {
    id: 'along-peitoral', name: 'Alongamento de peitoral', group: 'Postura', muscles: 'Peitoral',
    how: 'Antebraço no batente da porta, cotovelo na altura do ombro. Gire o tronco para o lado oposto até sentir o peito alongar. 30 s por lado.',
    videos: [], query: 'alongamento de peitoral no batente da porta',
  },
  {
    id: 'along-punhos', name: 'Alongamento de punhos', group: 'Postura', muscles: 'Punhos e antebraços',
    how: 'Braço estendido, palma para frente: puxe os dedos suavemente para trás. Depois palma para baixo e puxe para baixo. 20 a 30 s por lado.',
    videos: [v('Tx0PFExpLTk', 'Alongamento de flexores e extensores do punho'), v('IX14g4hQXl4', 'Exercícios de alongamentos para punhos')],
    query: 'alongamento de punhos para quem digita',
  },
];

export const exercises: Record<string, Exercise> = Object.fromEntries(list.map((e) => [e.id, e]));
export const exerciseList = list;
export const GROUPS: Group[] = ['Força', 'Core', 'Aquecimento', 'Alongamento e mobilidade', 'Postura'];

// ---------------- Rotinas ----------------
/**
 * Um item do treino.
 * - sets: número de séries (ex.: 3, ou '3 a 4').
 * - reps: quantidade em cada série (ex.: '12 a 15 repetições', '30 s por lado').
 * - rest: descanso entre as séries, em segundos (fora do circuito).
 * - hold / sides: tempo do cronômetro por série (e se conta cada lado).
 * - detail: observação extra (opcional).
 */
export type Item = {
  uid?: string; ex?: string; title?: string;
  sets?: number | string; reps?: string; rest?: number;
  /** segundos que o cronômetro conta em cada série (alongamentos, prancha, caminhada) */
  hold?: number;
  /** 2 = conta um lado e depois o outro (perna/lado) */
  sides?: 1 | 2;
  detail: string; optional?: boolean;
};
export type Section = { id: string; title: string; subtitle?: string; items: Item[]; log?: boolean };
export type DayPlan = { dow: number; name: string; title: string; subtitle: string; kind: 'corrida' | 'forca' | 'descanso'; sections: Section[] };

export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Atalho: exercício com séries e quantidade por série. */
const x = (ex: string, sets: number | string, reps: string, more: Partial<Item> = {}): Item => ({ ex, sets, reps, detail: '', ...more });

const runWarmup: Section = {
  id: 'aquec', title: 'Aquecimento dinâmico', subtitle: '5 a 8 min antes de correr, sem parar entre os exercícios',
  items: [
    x('caminhada-rapida', 1, '2 a 3 min', { detail: 'Aumente o ritmo aos poucos', hold: 120 }),
    x('balanco-frente-tras', 1, '10 por perna'),
    x('balanco-lateral', 1, '10 por perna'),
    x('afundo-rotacao', 1, '8 por perna'),
    x('agachamento', 1, '10 repetições'),
    x('marcha-alta', 2, '15 m', { detail: 'Volte caminhando entre as séries' }),
    x('calcanhar-gluteo', 2, '15 m', { detail: 'Volte caminhando entre as séries' }),
    x('circulos-quadril-tornozelo', 1, '8 a 10 para cada lado'),
  ],
};

const cooldown: Section = {
  id: 'alonga', title: 'Alongamento pós-corrida', subtitle: '5 min, parado, sem dor',
  items: [
    x('along-panturrilha', 1, '30 s por perna', { hold: 30, sides: 2 }),
    x('along-posterior', 1, '30 s por perna', { hold: 30, sides: 2 }),
    x('along-gluteo', 1, '30 s por lado', { hold: 30, sides: 2 }),
    x('along-flexor-quadril', 1, '30 a 40 s por lado', { hold: 30, sides: 2 }),
  ],
};

/** Rotina de postura (todo dia). skipFlexor: nos dias de corrida o flexor do quadril já está no alongamento pós-corrida. */
const postureItems: Item[] = [
    x('recuo-queixo', 1, '10 repetições', { detail: 'Segure 3 s em cada' }),
    x('anjo-parede', 1, '8 a 10 repetições'),
    x('ext-toracica', 1, '8 a 10 repetições'),
    x('along-peitoral', 1, '30 s por lado', { hold: 30, sides: 2 }),
    x('along-flexor-quadril', 1, '30 a 40 s por lado', { hold: 30, sides: 2 }),
    x('gato-camelo', 1, '8 a 10 repetições'),
    x('livro-aberto', 1, '8 por lado'),
    x('along-punhos', 1, '20 a 30 s por lado', { hold: 20, sides: 2 }),
];
const posture = (skipFlexor = false): Section => ({
  id: 'postura', title: 'Rotina de postura', subtitle: '5 a 8 min, 1 a 2 vezes por dia no trabalho',
  items: skipFlexor ? postureItems.filter((it) => it.ex !== 'along-flexor-quadril') : postureItems,
});

const night: Section = {
  id: 'noite', title: 'Antes de dormir',
  items: [x('prancha', 3, '30 s', { hold: 30, rest: 10, detail: '10 s de descanso entre as séries' })],
};

const strengthWarmup: Section = {
  id: 'aquec', title: 'Aquecimento', subtitle: '5 min. A 1ª série de cada exercício pode ser mais leve.',
  items: [
    x('aquec-forca', 1, '10 de cada movimento'),
    x('circulos-quadril-tornozelo', 1, '8 a 10 para cada lado'),
    x('gato-camelo', 1, '8 repetições', { detail: 'Movimento suave, sem forçar a lombar' }),
  ],
};

const circuitSubtitle = (rounds: number) =>
  `Em circuito: faça 1 série de cada exercício, em sequência (isso é 1 rodada), e repita ${rounds} vezes. Descanso de 45 a 60 s entre exercícios e 1 a 2 min entre rodadas.`;

// ---------------- Plano de corrida de 10 km (8 semanas) ----------------
export type DayRole = 'easy' | 'tempo' | 'long' | 'regen' | 'strength1' | 'strength2' | 'rest';
export type StrengthPref = 'corrida' | 'calistenia' | 'nenhum';

/** Treino da quinta: leve, com acelerações ou com blocos moderados. */
export type TempoSpec = { km: number; reps?: number; minutes?: number; strides?: number; veryEasy?: boolean };
export type PlanWeek = { week: number; easy: number; tempo: TempoSpec; long: number; note?: string };

export const PLAN_ID = 'plano-10k';
export const PLAN_WEEKS: PlanWeek[] = [
  { week: 1, easy: 4, tempo: { km: 4, strides: 4 }, long: 6 },
  { week: 2, easy: 4, tempo: { km: 4.5, reps: 3, minutes: 2 }, long: 7 },
  { week: 3, easy: 4.5, tempo: { km: 5, reps: 3, minutes: 3 }, long: 7 },
  { week: 4, easy: 4, tempo: { km: 4 }, long: 6, note: 'Semana de descarga: carga menor para recuperar' },
  { week: 5, easy: 5, tempo: { km: 5, reps: 3, minutes: 4 }, long: 8 },
  { week: 6, easy: 5, tempo: { km: 5, reps: 4, minutes: 3 }, long: 8.5 },
  { week: 7, easy: 4, tempo: { km: 5, reps: 3, minutes: 3 }, long: 9 },
  { week: 8, easy: 3, tempo: { km: 3, veryEasy: true }, long: 10, note: 'Semana do objetivo: carga menor antes dos 10 km' },
];
export const PLAN_LENGTH = PLAN_WEEKS.length;
export const DELOAD_WEEK = 4;
/** Recuperação leve entre os blocos moderados (segundos). */
export const TEMPO_RECOVERY = 120;

/** 4.5 -> "4,5" */
export const km = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

export function tempoTitle(t: TempoSpec): string {
  if (t.strides) return `${km(t.km)} km leve + ${t.strides} acelerações de 20 s`;
  if (t.reps && t.minutes) return `${km(t.km)} km com ${t.reps} × ${t.minutes} min moderados`;
  return `${km(t.km)} km ${t.veryEasy ? 'muito leve' : 'leve'}`;
}

const MODERATE = 'Moderado: esforço 6 a 7 de 10, controlado, sem sprint';
const WARMUP_TEXT = 'Antes: 5 a 8 min de aquecimento dinâmico (lista abaixo). Os primeiros 10 min da corrida, mais leves.';

/** Texto e itens da corrida de um dia do plano. `pace` = faixa do ritmo leve (ex.: "6:20–7:00 min/km"). */
export function runInfo(slot: 'easy' | 'tempo' | 'long' | 'regen', w: PlanWeek, pace: string) {
  const easy = `Leve: ${pace}, conseguindo conversar`;
  if (slot === 'easy') {
    return { title: `Corrida leve: ${km(w.easy)} km`, km: w.easy, intensity: easy, warmup: WARMUP_TEXT,
      objective: 'Construir base aeróbica sem cansar demais.',
      items: [{ title: `Correr ${km(w.easy)} km leve`, detail: 'Ritmo de conversa. A distância inclui aquecimento e desaceleração.' }] as Item[] };
  }
  if (slot === 'long') {
    const goal = w.long >= 10;
    return { title: goal ? `Longão: ${km(w.long)} km (o objetivo!)` : `Longão: ${km(w.long)} km`, km: w.long,
      intensity: 'Leve, conversando; sem meta de velocidade', warmup: WARMUP_TEXT,
      objective: goal ? 'Completar os 10 km com calma. Comece devagar e termine inteiro.' : 'Aumentar a resistência para chegar aos 10 km.',
      items: [{ title: `Correr ${km(w.long)} km`, detail: 'Bem leve. Se estiver muito cansado, encurte em vez de pular. Hidrate-se.' }] as Item[] };
  }
  if (slot === 'regen') {
    return { title: 'Regenerativo (opcional)', km: 0, intensity: 'Muito leve', warmup: 'Sem aquecimento específico.',
      objective: 'Soltar as pernas e recuperar. Pode pular se estiver cansado.',
      items: [{ title: 'Caminhada ou pedal leve', detail: '20 a 30 min, bem tranquilo', optional: true }] as Item[] };
  }
  const t = w.tempo;
  const items: Item[] = [{ title: `Correr ${tempoTitle(t)}`, detail: t.reps
    ? 'Aqueça 10 min leve, faça os blocos moderados e termine leve até completar a distância.'
    : 'Ritmo de conversa. A distância inclui aquecimento e desaceleração.' }];
  if (t.strides) items.push({ title: `${t.strides} acelerações de 20 s`, sets: t.strides, reps: '20 s rápido, sem sprint', hold: 20, rest: 60,
    detail: 'No fim da corrida. Entre elas, 1 min de trote leve ou caminhada.' });
  if (t.reps && t.minutes) items.push({ title: `Blocos moderados: ${t.reps} × ${t.minutes} min`, sets: t.reps, reps: `${t.minutes} min moderado (6 a 7 de 10)`,
    hold: t.minutes * 60, rest: TEMPO_RECOVERY, detail: '2 min de trote leve entre os blocos' });
  return { title: `Corrida: ${tempoTitle(t)}`, km: t.km,
    intensity: t.reps ? `${easy}; blocos: ${MODERATE.toLowerCase()}` : t.veryEasy ? `Muito leve: mais devagar que ${pace}` : easy,
    warmup: WARMUP_TEXT,
    objective: t.reps ? 'Sustentar um ritmo um pouco mais forte, com recuperação leve entre os blocos.'
      : t.strides ? 'Base aeróbica e um pouco de soltura nas pernas com acelerações curtas.'
      : t.veryEasy ? 'Chegar descansado ao longão de 10 km.' : 'Recuperar na semana de descarga.',
    items };
}

const strengthRunning: Section = {
  id: 'forca', title: 'Fortalecimento para corrida', log: true,
  subtitle: '2 séries de cada, 60 s de descanso entre as séries. Lombar: movimento controlado e amplitude sem dor; pare se doer.',
  items: [
    x('ponte-gluteo', 2, '12 repetições', { rest: 60 }),
    x('agachamento', 2, '10 repetições', { rest: 60 }),
    x('panturrilha', 2, '15 repetições', { rest: 60 }),
    x('bird-dog', 2, '8 por lado', { rest: 60 }),
    x('prancha-lateral', 2, '20 s por lado', { hold: 20, sides: 2, rest: 30, detail: 'Estabilidade lateral do tronco e do quadril' }),
  ],
};

const restDay: Section = {
  id: 'descanso', title: 'Movimento leve', items: [{ title: 'Caminhada leve', detail: '15 a 30 min, opcional', optional: true }],
};

const mobility: Section = {
  id: 'mobilidade', title: 'Mobilidade e alongamento', subtitle: '15 min, sem dor',
  items: [
    x('along-panturrilha', 1, '30 s por perna', { hold: 30, sides: 2 }),
    x('along-posterior', 1, '30 s por perna', { hold: 30, sides: 2 }),
    x('along-gluteo', 1, '30 s por lado', { hold: 30, sides: 2 }),
    x('along-flexor-quadril', 1, '30 a 40 s por lado', { hold: 30, sides: 2 }),
    x('mob-tornozelo', 1, '10 repetições por perna'),
    x('gato-camelo', 1, '8 a 10 repetições'),
    x('livro-aberto', 1, '8 por lado'),
  ],
};

function calisthenics(which: 'A' | 'B', week: number): Omit<DayPlan, 'dow' | 'name'> {
  const rounds = week === DELOAD_WEEK ? 2 : 3;
  if (which === 'A') {
    return { title: 'Calistenia A', subtitle: 'Pernas, costas e core: força para correr', kind: 'forca',
      sections: [strengthWarmup,
        { id: 'treino', title: `Treino: ${rounds} rodadas`, subtitle: circuitSubtitle(rounds), log: true,
          items: [
            x('agachamento', rounds, '12 a 15 repetições'),
            x('step-up', rounds, '8 a 10 por perna'),
            x('stiff-unilateral', rounds, '8 a 10 por perna', { detail: 'Se a lombar incomodar, troque por ponte de glúteo' }),
            x('ponte-gluteo', rounds, '12 a 15 repetições'),
            x('panturrilha', rounds, '15 repetições'),
            x('barra-fixa', rounds, 'o máximo que conseguir + 3 negativas', { detail: 'Negativa: suba com ajuda e desça devagar, em 4 a 5 s' }),
            x('dead-bug', rounds, '8 por lado'),
          ] },
        posture(), night] };
  }
  return { title: 'Calistenia B', subtitle: 'Parte superior e postura, pernas leves', kind: 'forca',
    sections: [strengthWarmup,
      { id: 'treino', title: `Treino: ${rounds} rodadas`, subtitle: circuitSubtitle(rounds), log: true,
        items: [
          x('flexao', rounds, 'o máximo com boa forma', { detail: 'Meta: 8 a 12 repetições' }),
          x('remada-invertida', rounds, '8 a 12 repetições'),
          x('y-t-w', rounds, '6 de cada letra'),
          x('bird-dog', rounds, '8 por lado'),
          x('prancha-lateral', rounds, '20 a 30 s por lado', { hold: 20, sides: 2 }),
          x('panturrilha', rounds, '15 repetições', { detail: 'Leve' }),
        ] },
      posture(), night] };
}

/**
 * Rotina de um dia: depende do papel do dia no plano (corrida leve, moderada, longão...),
 * da semana do plano (1 a 8) e da preferência de fortalecimento.
 */
export function buildRoutine(dow: number, role: DayRole, week: number, strength: StrengthPref, pace: string): DayPlan {
  const w = PLAN_WEEKS[Math.min(Math.max(week, 1), PLAN_LENGTH) - 1];
  const base = { dow, name: DAY_NAMES[dow] };
  let p: Omit<DayPlan, 'dow' | 'name'>;
  if (role === 'easy' || role === 'tempo' || role === 'long') {
    const r = runInfo(role, w, pace);
    const label = role === 'easy' ? 'Corrida leve' : role === 'long' ? 'Longão' : 'Corrida com variação';
    p = { title: label, subtitle: r.title.replace(/^[^:]+: /, ''), kind: 'corrida',
      sections: [runWarmup, { id: 'corrida', title: label, items: r.items }, cooldown, posture(true), night] };
  } else if (role === 'regen') {
    const r = runInfo('regen', w, pace);
    p = { title: 'Regenerativo', subtitle: 'Opcional: caminhada ou pedal leve e mobilidade', kind: 'descanso',
      sections: [{ id: 'corrida', title: 'Regenerativo (opcional)', items: r.items }, mobility, posture(true), night] };
  } else if ((role === 'strength1' || role === 'strength2') && strength === 'calistenia') {
    p = calisthenics(role === 'strength1' ? 'A' : 'B', week);
  } else if ((role === 'strength1' || role === 'strength2') && strength === 'corrida') {
    p = { title: 'Fortalecimento', subtitle: 'Glúteos, quadríceps, panturrilhas e tronco', kind: 'forca',
      sections: [strengthWarmup, strengthRunning, posture(), night] };
  } else {
    p = { title: 'Descanso', subtitle: 'Recuperação: é aqui que você evolui', kind: 'descanso',
      sections: [restDay, posture(), night] };
  }
  const plan = { ...base, ...p };
  return { ...plan, sections: plan.sections.map((s) => ({ ...s, items: s.items.map((it, i) => ({ ...it, uid: `${s.id}:${i}` })) })) };
}

export function stepsOf(ex: Exercise): string[] {
  if (ex.steps && ex.steps.length) return ex.steps;
  return (ex.how.match(/[^.!?]+[.!?]*/g) ?? [ex.how]).map((s) => s.trim()).filter(Boolean);
}

export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1, 12) || null;
    const q = u.searchParams.get('v');
    if (q) return q.slice(0, 11);
    const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}
