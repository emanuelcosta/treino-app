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

export type RunWeek = { week: number; seg: number; qua: number; sex: number; dom: number; note?: string };
export const runPlan: RunWeek[] = [
  { week: 1, seg: 4, qua: 5, sex: 7, dom: 3 },
  { week: 2, seg: 5, qua: 5, sex: 8, dom: 3 },
  { week: 3, seg: 5, qua: 6, sex: 9, dom: 4 },
  { week: 4, seg: 4, qua: 5, sex: 6, dom: 3, note: 'Semana de descarga' },
  { week: 5, seg: 5, qua: 6, sex: 10, dom: 4 },
];

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
    { title: 'Acelerações leves', sets: '3 a 4', reps: '15 a 20 s', detail: 'Caminhe entre elas até recuperar o fôlego', hold: 15, rest: 45, optional: true },
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

const posture: Section = {
  id: 'postura', title: 'Rotina de postura', subtitle: '5 a 8 min, 1 a 2 vezes por dia no trabalho',
  items: [
    x('recuo-queixo', 1, '10 repetições', { detail: 'Segure 3 s em cada' }),
    x('anjo-parede', 1, '8 a 10 repetições'),
    x('ext-toracica', 1, '8 a 10 repetições'),
    x('along-peitoral', 1, '30 s por lado', { hold: 30, sides: 2 }),
    x('along-flexor-quadril', 1, '30 a 40 s por lado', { hold: 30, sides: 2 }),
    x('gato-camelo', 1, '8 a 10 repetições'),
    x('livro-aberto', 1, '8 por lado'),
    x('along-punhos', 1, '20 a 30 s por lado', { hold: 20, sides: 2 }),
  ],
};

const night: Section = {
  id: 'noite', title: 'Antes de dormir',
  items: [x('prancha', 3, '30 s', { hold: 30, rest: 10, detail: '10 s de descanso entre as séries' })],
};

const strengthWarmup: Section = {
  id: 'aquec', title: 'Aquecimento', subtitle: '5 min',
  items: [
    x('aquec-forca', 1, '10 de cada movimento'),
    x('gato-camelo', 1, '8 repetições'),
    x('agachamento', 1, '10 repetições'),
    x('ponte-gluteo', 1, '10 repetições'),
  ],
};

const circuitSubtitle = (rounds: number) =>
  `Em circuito: faça 1 série de cada exercício, em sequência (isso é 1 rodada), e repita ${rounds} vezes. Descanso de 45 a 60 s entre exercícios e 1 a 2 min entre rodadas.`;

export function runKm(dow: number, week: number): number {
  const w = runPlan[Math.min(Math.max(week, 1), 5) - 1];
  return ({ 1: w.seg, 3: w.qua, 5: w.sex, 0: w.dom } as Record<number, number>)[dow] ?? 0;
}

function buildDayPlan(dow: number, week: number): DayPlan {
  const name = DAY_NAMES[dow];
  const rounds = week === 4 ? 2 : 3;
  const km = runKm(dow, week);
  const base = { dow, name };

  if (dow === 1 || dow === 3) {
    return { ...base, title: 'Corrida', subtitle: `${km} km em ritmo de conversa`, kind: 'corrida',
      sections: [runWarmup,
        { id: 'corrida', title: 'Corrida', items: [{ title: `Correr ${km} km`, detail: 'Ritmo de conversa. Nos primeiros 10 min, mais leve ainda e acelere aos poucos.' }] },
        cooldown, posture, night] };
  }
  if (dow === 5) {
    return { ...base, title: 'Longão', subtitle: `${km} km: o treino mais importante da semana`, kind: 'corrida',
      sections: [runWarmup,
        { id: 'corrida', title: 'Longão', items: [{ title: `Correr ${km} km`, detail: 'Ritmo de conversa, bem controlado. Se estiver muito cansado, encurte em vez de pular.' }] },
        cooldown, posture, night] };
  }
  if (dow === 0) {
    return { ...base, title: 'Corrida leve', subtitle: `${km} km bem tranquilos para soltar as pernas`, kind: 'corrida',
      sections: [runWarmup,
        { id: 'corrida', title: 'Corrida leve', items: [{ title: `Correr ${km} km`, detail: 'Trote bem tranquilo. Se estiver pesado, troque por caminhada.' }] },
        cooldown, posture, night] };
  }
  if (dow === 2) {
    return { ...base, title: 'Calistenia A', subtitle: 'Pernas, costas e core: força para correr', kind: 'forca',
      sections: [strengthWarmup,
        { id: 'treino', title: `Treino: ${rounds} rodadas`, subtitle: circuitSubtitle(rounds), log: true,
          items: [
            x('agachamento', rounds, '12 a 15 repetições'),
            x('step-up', rounds, '8 a 10 por perna'),
            x('stiff-unilateral', rounds, '8 a 10 por perna'),
            x('ponte-gluteo', rounds, '12 a 15 repetições'),
            x('panturrilha', rounds, '15 repetições'),
            x('barra-fixa', rounds, 'o máximo que conseguir + 3 negativas', { detail: 'Negativa: suba com ajuda e desça devagar, em 4 a 5 s' }),
            x('dead-bug', rounds, '8 por lado'),
          ] },
        posture, night] };
  }
  if (dow === 4) {
    return { ...base, title: 'Calistenia B', subtitle: 'Parte superior e postura, pernas leves', kind: 'forca',
      sections: [strengthWarmup,
        { id: 'treino', title: `Treino: ${rounds} rodadas`, subtitle: circuitSubtitle(rounds), log: true,
          items: [
            x('flexao', rounds, 'o máximo com boa forma', { detail: 'Meta: 8 a 12 repetições' }),
            x('remada-invertida', rounds, '8 a 12 repetições'),
            x('flexao-fechada', rounds, '6 a 10 repetições'),
            x('y-t-w', rounds, '6 de cada letra'),
            x('bird-dog', rounds, '8 por lado'),
            x('prancha-lateral', rounds, '20 a 30 s por lado', { hold: 20, sides: 2 }),
            x('panturrilha', rounds, '15 repetições', { detail: 'Leve' }),
          ] },
        posture, night] };
  }
  return { ...base, title: 'Descanso ativo', subtitle: 'Recuperação: é aqui que você evolui', kind: 'descanso',
    sections: [
      { id: 'descanso', title: 'Movimento leve', items: [{ title: 'Caminhada ou pedal leve', detail: '20 a 40 min, bem tranquilo (opcional)', optional: true }] },
      { id: 'mobilidade', title: 'Mobilidade e alongamento', subtitle: '15 min, sem dor',
        items: [
          x('along-panturrilha', 1, '30 s por perna', { hold: 30, sides: 2 }),
          x('along-posterior', 1, '30 s por perna', { hold: 30, sides: 2 }),
          x('along-gluteo', 1, '30 s por lado', { hold: 30, sides: 2 }),
          x('along-flexor-quadril', 1, '30 a 40 s por lado', { hold: 30, sides: 2 }),
          x('mob-tornozelo', 1, '10 repetições por perna'),
          x('gato-camelo', 1, '8 a 10 repetições'),
          x('livro-aberto', 1, '8 por lado'),
        ] },
      posture, night] };
}

export function getDayPlan(dow: number, week: number): DayPlan {
  const p = buildDayPlan(dow, week);
  return { ...p, sections: p.sections.map((s) => ({ ...s, items: s.items.map((it, i) => ({ ...it, uid: `${s.id}:${i}` })) })) };
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
