// Ilustração passo a passo de cada exercício da biblioteca (id do exercício -> quadros).
// Convenções em ./types.ts. Chão em y = 170; em pé, quadril em y ≈ 98 e tornozelo em y = 166.
import type { Frame, Pose, Pt } from './types';

const A = 166; // tornozelo no chão

const stand = (x = 100, extra: Partial<Pose> = {}): Pose => ({
  hip: [x, 98], torso: 180,
  arms: [{ a: [6, 4] }, { a: [-6, -4] }],
  legs: [[x + 3, A], [x - 3, A]],
  ...extra,
});
const down = (x: number, y1: number, y2: number, label?: string) => ({ from: [x, y1] as Pt, to: [x, y2] as Pt, label });
const fwd = (y: number, x1: number, x2: number, label?: string) => ({ from: [x1, y] as Pt, to: [x2, y] as Pt, label });

// ---------- quatro apoios (bird dog, gato-camelo) ----------
const quad = (extra: Partial<Pose> = {}): Pose => ({
  hip: [80, 132], torso: 107.5,
  arms: [[118, 168], [115, 168]],
  legs: [[46, A], [49, A]], feet: [[-9, 1], [-9, 1]],
  ...extra,
});

// ---------- flexão ----------
const pushTop: Pose = {
  hip: [113, 135.4], torso: 112.7, arms: [[150, 168], [147, 168]], legs: [[50, 162], [52, 162]], feet: [[4, 7], [4, 7]],
  props: [{ t: 'line', from: [44, 166], to: [176, 110] }],
};
const pushBottom: Pose = {
  hip: [108.4, 155.4], torso: 97.7, arms: [[150, 168], [147, 168]], legs: [[41, 164], [43, 164]], feet: [[4, 7], [4, 7]],
  arrows: [down(184, 112, 146)],
};

// ---------- deitado de costas ----------
const supine = (extra: Partial<Pose> = {}): Pose => ({ hip: [124, 161], torso: -90, neck: -90, arms: [{ a: [90, 90] }, { a: [90, 90] }], legs: [[160, 165], [162, 165]], ...extra });

// ---------- cadeira ----------
const seated = (extra: Partial<Pose> = {}): Pose => ({
  hip: [86, 129], torso: 180, legs: [[124, 165], [121, 165]], arms: [[112, 126], [110, 127]],
  props: [{ t: 'chair', x: 74, seat: 133, back: 92, w: 44 }],
  ...extra,
});

const box = (x: number, y: number, w: number, h: number) => ({ t: 'box' as const, x, y, w, h });

export const illustrations: Record<string, Frame[]> = {
  // ===================== FORÇA =====================
  agachamento: [
    { caption: 'Em pé, pés na largura dos ombros e pontas levemente para fora.', pose: stand(104, { legs: [[108, A], [105, A]] }) },
    { caption: 'Desça como se fosse sentar numa cadeira: quadril para trás e peito aberto, até as coxas ficarem paralelas ao chão.', pose: {
      hip: [84, 134], torso: 140, arms: [{ a: [90, 90] }, { a: [88, 88] }], legs: [[108, A], [105, A]], hl: ['leg0', 'leg1'],
      arrows: [down(58, 98, 130)] } },
    { caption: 'Joelhos na direção dos pés. Suba empurrando o chão com o pé inteiro.', pose: stand(104, { legs: [[108, A], [105, A]], arrows: [down(70, 130, 96)] }) },
  ],
  'step-up': [
    { caption: 'Apoie o pé inteiro num degrau firme (altura do joelho ou menos).', pose: {
      hip: [98, 100], torso: 174, arms: [{ a: [15, 25] }, { a: [-10, -5] }], legs: [{ to: [130, 140] }, [97, A]], hl: ['leg0'],
      props: [box(112, 144, 60, 26)] } },
    { caption: 'Suba fazendo força só com a perna de cima. A de baixo não dá impulso.', pose: {
      hip: [128, 74], torso: 178, arms: [{ a: [-12, -5] }, { a: [12, 20] }], legs: [[130, 140], { to: [118, 128] }], hl: ['leg0'],
      props: [box(112, 144, 60, 26)], arrows: [down(80, 130, 86)] } },
    { caption: 'Desça devagar, controlando, e repita. Depois troque a perna.', pose: {
      hip: [98, 100], torso: 174, arms: [{ a: [15, 25] }, { a: [-10, -5] }], legs: [{ to: [130, 140] }, [97, A]],
      props: [box(112, 144, 60, 26)], arrows: [down(70, 88, 128)] } },
  ],
  'stiff-unilateral': [
    { caption: 'Em pé numa perna, joelho levemente dobrado. A outra perna fica solta.', pose: {
      hip: [104, 100], torso: 180, arms: [{ a: [3, 3] }, { a: [-3, -3] }], legs: [[106, A], [92, 158]], feet: [null, [8, 5]] } },
    { caption: 'Incline o tronco à frente e leve a outra perna para trás, costas retas, até sentir a parte de trás da coxa.', pose: {
      hip: [100, 100], torso: 100, arms: [{ a: [0, 0] }, { a: [5, 5] }], legs: [[108, A], { a: [-80, -80] }], feet: [null, [3, 8]], hl: ['leg1'],
      props: [{ t: 'line', from: [30, 113], to: [150, 92] }], arrows: [{ from: [150, 52], to: [170, 88], bend: -12 }] } },
    { caption: 'Volte à posição em pé apertando o glúteo.', pose: {
      hip: [104, 100], torso: 180, arms: [{ a: [3, 3] }, { a: [-3, -3] }], legs: [[106, A], [92, 158]], feet: [null, [8, 5]],
      arrows: [{ from: [150, 90], to: [126, 44], bend: 12 }] } },
  ],
  'ponte-gluteo': [
    { caption: 'Deitado de barriga para cima, joelhos dobrados e pés apoiados no chão.', pose: supine({ hip: [116, 161], legs: [[141, 165], [144, 165]] }) },
    { caption: 'Suba o quadril até formar uma linha do ombro ao joelho. Aperte o glúteo por 1 s.', pose: supine({
      hip: [110, 137], torso: -58.3, legs: [[141, 165], [144, 165]], hl: ['leg0', 'leg1'],
      props: [{ t: 'line', from: [66, 162], to: [152, 127.5] }], arrows: [down(96, 162, 128)] }) },
    { caption: 'Desça devagar, sem largar o quadril de uma vez, e repita.', pose: supine({ hip: [116, 161], legs: [[141, 165], [144, 165]], arrows: [down(96, 126, 154)] }) },
  ],
  panturrilha: [
    { caption: 'Pontas dos pés na borda do degrau, calcanhares para fora. Se precisar, apoie a mão na parede.', pose: {
      hip: [99, 80], torso: 180, arms: [{ a: [4, 4] }, { to: [62, 104] }], legs: [[99, 148], [96, 148]], feet: [[10, -2], [10, -2]],
      props: [box(100, 146, 62, 24), { t: 'post', x: 52 }] } },
    { caption: 'Suba o máximo na ponta dos pés e segure 1 s.', pose: {
      hip: [101, 66], torso: 180, arms: [{ a: [4, 4] }, { to: [62, 92] }], legs: [[102, 134], [99, 134]], feet: [[8, 12], [8, 12]], hl: ['leg0'],
      props: [box(100, 146, 62, 24), { t: 'post', x: 52 }], arrows: [down(140, 128, 100)] } },
    { caption: 'Desça devagar, em 3 s, deixando o calcanhar passar da borda para alongar.', pose: {
      hip: [99, 80], torso: 180, arms: [{ a: [4, 4] }, { to: [62, 104] }], legs: [[99, 148], [96, 148]], feet: [[10, -2], [10, -2]],
      props: [box(100, 146, 62, 24), { t: 'post', x: 52 }], arrows: [down(140, 100, 130, '3 s')] } },
  ],
  'barra-fixa': [
    { caption: 'Pegada com as palmas para a frente, um pouco mais larga que os ombros. Braços esticados.', pose: {
      hip: [100, 112], torso: 180, arms: [[104, 24], [96, 24]], legs: [[84, 160], [80, 156]], feet: [[4, 8], [4, 8]],
      props: [{ t: 'bar', x1: 40, x2: 170, y: 24 }] } },
    { caption: 'Puxe até o queixo passar da barra, levando os cotovelos para baixo.', pose: {
      hip: [97, 66], torso: 175, arms: [{ a: [20, 180] }, { a: [-10, 180] }], legs: [[86, 128], [82, 124]], feet: [[4, 8], [4, 8]], hl: ['arm0', 'arm1'],
      props: [{ t: 'bar', x1: 40, x2: 170, y: 24 }], arrows: [down(150, 110, 60)] } },
    { caption: 'Negativa: suba com ajuda (pulo ou degrau) e desça bem devagar, em 4 a 5 s.', pose: {
      hip: [97, 66], torso: 175, arms: [{ a: [20, 180] }, { a: [-10, 180] }], legs: [[86, 128], [82, 124]], feet: [[4, 8], [4, 8]],
      props: [{ t: 'bar', x1: 40, x2: 170, y: 24 }, box(60, 146, 50, 24)], arrows: [down(150, 60, 112, '4–5 s')] } },
  ],
  flexao: [
    { caption: 'Mãos um pouco mais largas que os ombros. Corpo em linha reta: aperte glúteo e abdômen.', pose: pushTop },
    { caption: 'Desça até o peito quase tocar o chão, cotovelos a cerca de 45° do tronco.', pose: { ...pushBottom, hl: ['arm0'] } },
    { caption: 'Empurre o chão e suba mantendo o corpo reto (o quadril não cai).', pose: { ...pushTop, props: [], arrows: [down(184, 146, 112)] } },
  ],
  'flexao-fechada': [
    { caption: 'Mãos embaixo do peito, na largura dos ombros. Corpo em linha reta.', pose: pushTop },
    { caption: 'Desça com os cotovelos rente ao corpo, apontando para trás.', pose: { ...pushBottom, hl: ['arm0'] } },
    { caption: 'Suba empurrando o chão, sem deixar o quadril cair.', pose: { ...pushTop, props: [], arrows: [down(184, 146, 112)] } },
  ],
  'remada-invertida': [
    { caption: 'Deitado sob uma mesa firme, segure a borda com as mãos um pouco mais largas que os ombros.', pose: {
      hip: [136.7, 152.2], torso: -104.8, arms: [[98, 95], [94, 95]], legs: [[200, 165], [198, 165]], feet: [[3, -9], [3, -9]],
      props: [{ t: 'table', x1: 14, x2: 104, y: 90 }] } },
    { caption: 'Corpo em linha reta. Puxe o peito até a borda juntando as escápulas.', pose: {
      hip: [139.3, 132.8], torso: -118, arms: [[98, 95], [94, 95]], legs: [[198, 164], [196, 164]], feet: [[3, -9], [3, -9]], hl: ['arm0', 'arm1'],
      props: [{ t: 'table', x1: 14, x2: 104, y: 90 }, { t: 'line', from: [88, 106], to: [206, 166] }], arrows: [down(150, 150, 122)] } },
    { caption: 'Desça controlando até esticar os braços e repita.', pose: {
      hip: [136.7, 152.2], torso: -104.8, arms: [[98, 95], [94, 95]], legs: [[200, 165], [198, 165]], feet: [[3, -9], [3, -9]],
      props: [{ t: 'table', x1: 14, x2: 104, y: 90 }], arrows: [down(160, 118, 146)] } },
  ],
  'y-t-w': [
    { caption: 'Visto de cima: de bruços, testa na toalha. Braços em Y acima da cabeça, polegares para cima. Levante-os do chão.', pose: {
      view: 'front', floor: false, face: false, hip: [92, 90], torso: 90, arms: [{ a: [125, 125] }, { a: [55, 55] }],
      legs: [{ a: [-85, -85] }, { a: [-95, -95] }], feet: [[-3, -2], [-3, 2]], hl: ['arm0', 'arm1'],
      props: [{ t: 'mat', x: 14, y: 26, w: 192, h: 128 }, { t: 'towel', x: 160, y: 86 }] } },
    { caption: 'T: braços abertos para os lados. Aperte as escápulas e segure 1 s.', pose: {
      view: 'front', floor: false, face: false, hip: [92, 90], torso: 90, arms: [{ a: [180, 180] }, { a: [0, 0] }],
      legs: [{ a: [-85, -85] }, { a: [-95, -95] }], feet: [[-3, -2], [-3, 2]], hl: ['arm0', 'arm1'],
      props: [{ t: 'mat', x: 14, y: 26, w: 192, h: 128 }, { t: 'towel', x: 160, y: 86 }] } },
    { caption: 'W: cotovelos dobrados, puxe as escápulas para baixo e para trás.', pose: {
      view: 'front', floor: false, face: false, hip: [92, 90], torso: 90, arms: [{ a: [-150, 140] }, { a: [-30, 40] }],
      legs: [{ a: [-85, -85] }, { a: [-95, -95] }], feet: [[-3, -2], [-3, 2]], hl: ['arm0', 'arm1'],
      props: [{ t: 'mat', x: 14, y: 26, w: 192, h: 128 }, { t: 'towel', x: 160, y: 86 }] } },
  ],
  'dead-bug': [
    { caption: 'Deitado de costas, braços apontando para o teto e joelhos dobrados a 90°.', pose: supine({
      arms: [{ a: [180, 180] }, { a: [180, 180] }], legs: [{ a: [180, 90] }, { a: [180, 90] }], feet: [[2, -8], [2, -8]] }) },
    { caption: 'Com a lombar colada no chão, estique devagar um braço para trás e a perna oposta para a frente.', pose: supine({
      arms: [{ a: [-100, -100] }, { a: [180, 180] }], legs: [{ a: [180, 90] }, { a: [95, 95] }], feet: [[2, -8], [8, -3]], hl: ['arm0', 'leg1'] }) },
    { caption: 'Volte ao centro e troque: o outro braço com a outra perna.', pose: supine({
      arms: [{ a: [180, 180] }, { a: [-100, -100] }], legs: [{ a: [95, 95] }, { a: [180, 90] }], feet: [[8, -3], [2, -8]], hl: ['arm1', 'leg0'] }) },
  ],
  'bird-dog': [
    { caption: 'Em quatro apoios: mãos embaixo dos ombros e joelhos embaixo do quadril.', pose: quad() },
    { caption: 'Estique um braço à frente e a perna oposta para trás, sem girar o quadril. Segure 2 s.', pose: quad({
      arms: [{ a: [100, 100] }, [115, 168]], legs: [[46, A], { a: [-95, -95] }], feet: [[-9, 1], [1, 8]], hl: ['arm0', 'leg1'] }) },
    { caption: 'Volte e alterne: o outro braço com a outra perna.', pose: quad({
      arms: [[118, 168], { a: [100, 100] }], legs: [{ a: [-95, -95] }, [49, A]], feet: [[1, 8], [-9, 1]], hl: ['arm1', 'leg0'] }) },
  ],
  'prancha-lateral': [
    { caption: 'Deite de lado com o antebraço no chão e o cotovelo bem embaixo do ombro.', pose: {
      hip: [102, 159], torso: -115.3, arms: [{ a: [0, -90] }, { a: [64.7, 64.7] }], legs: [[170, 165], [172, 162]], feet: [[3, 4], [3, 4]] } },
    { caption: 'Suba o quadril até o corpo formar uma linha reta e segure.', pose: {
      hip: [105.1, 150.5], torso: -102.2, arms: [{ a: [0, -90] }, { a: [77.8, 77.8] }], legs: [[171.5, 165], [173, 162]], feet: [[3, 4], [3, 4]],
      props: [{ t: 'line', from: [44, 138], to: [182, 168] }], arrows: [down(122, 168, 140)] } },
  ],
  prancha: [
    { caption: 'Antebraços no chão, cotovelos bem embaixo dos ombros.', pose: {
      hip: [91.1, 151.5], torso: 103.7, arms: [{ a: [0, 90] }, { a: [0, 88] }], legs: [[23, 165], [24, 165]], feet: [[3, 6], [3, 6]] } },
    { caption: 'Corpo em linha reta da cabeça aos calcanhares. Aperte glúteo e abdômen e respire normalmente.', pose: {
      hip: [91.1, 151.5], torso: 103.7, arms: [{ a: [0, 90] }, { a: [0, 88] }], legs: [[23, 165], [24, 165]], feet: [[3, 6], [3, 6]],
      props: [{ t: 'line', from: [18, 165], to: [156, 133] }] } },
  ],

  // ===================== AQUECIMENTO =====================
  'aquec-forca': [
    { caption: 'Braços à frente: gire os punhos 10 vezes para cada lado.', pose: stand(96, { arms: [{ a: [88, 88] }, { a: [84, 84] }], arrows: [{ c: [146, 62], r: 8 }] }) },
    { caption: 'Círculos de braços: 10 para a frente e 10 para trás, aumentando o tamanho aos poucos.', pose: stand(96, { arms: [{ a: [160, 160] }, { a: [-12, -8] }], hl: ['arm0'], arrows: [{ c: [96, 58], r: 52 }] }) },
  ],
  'caminhada-rapida': [
    { caption: 'Comece caminhando rápido, com os braços soltos acompanhando o passo.', pose: {
      hip: [100, 100], torso: 176, legs: [[122, 164], [80, 160]], feet: [[9, -4], [8, 6]], arms: [{ a: [-25, -15] }, { a: [25, 45] }] } },
    { caption: 'Aumente aos poucos para um trote leve, por 2 a 3 minutos.', pose: {
      hip: [100, 96], torso: 172, legs: [[114, 140], [70, 150]], feet: [[9, 3], [6, 8]], arms: [{ a: [-35, 55] }, { a: [35, 125] }] } },
  ],
  'balanco-frente-tras': [
    { caption: 'Mão apoiada na parede. Balance a perna solta para a frente...', pose: stand(100, {
      arms: [{ a: [8, 20] }, [70, 80]], legs: [{ a: [50, 30] }, [98, A]], feet: [[8, -4], null], hl: ['leg0'],
      props: [{ t: 'post', x: 60 }], arrows: [{ from: [96, 160], to: [156, 136], bend: -14 }] }) },
    { caption: '...e para trás, com controle, sem arquear a lombar. 10 por perna.', pose: stand(100, {
      arms: [{ a: [8, 20] }, [70, 80]], legs: [{ a: [-35, -25] }, [98, A]], feet: [[6, 6], null], hl: ['leg0'],
      props: [{ t: 'post', x: 60 }], arrows: [{ from: [104, 160], to: [56, 150], bend: 12 }] }) },
  ],
  'balanco-lateral': [
    { caption: 'De frente para a parede, mãos apoiadas. Balance a perna para o lado...', pose: {
      view: 'front', face: false, hip: [100, 98], torso: 180, arms: [{ a: [-20, 160] }, { a: [20, -160] }],
      legs: [[91, A], { a: [35, 35] }], hl: ['leg1'], props: [{ t: 'panel' }], arrows: [{ from: [104, 162], to: [150, 150], bend: 10 }] } },
    { caption: '...e cruze na frente do corpo, de um lado ao outro, com controle. 10 por perna.', pose: {
      view: 'front', face: false, hip: [100, 98], torso: 180, arms: [{ a: [-20, 160] }, { a: [20, -160] }],
      legs: [[91, A], { a: [-25, -25] }], hl: ['leg1'], props: [{ t: 'panel' }], arrows: [{ from: [120, 150], to: [70, 156], bend: -10 }] } },
  ],
  'afundo-rotacao': [
    { caption: 'Dê um passo longo à frente e desça em afundo: os dois joelhos dobram.', pose: {
      hip: [100, 128], torso: 180, arms: [{ a: [30, 150] }, { a: [25, 150] }], legs: [[134, 164], [54, 160]], feet: [[10, 3], [7, 7]], hl: ['leg0'],
      arrows: [down(70, 92, 122)] } },
    { caption: 'Gire o tronco para o lado da perna da frente. Volte e siga com a outra perna. 8 por perna.', pose: {
      hip: [100, 128], torso: 180, arms: [{ a: [90, 90] }, { a: [-90, -90] }], legs: [[134, 164], [54, 160]], feet: [[10, 3], [7, 7]], hl: ['arm0', 'arm1'],
      arrows: [{ c: [100, 100], r: 30, ry: 8 }] } },
  ],
  'marcha-alta': [
    { caption: 'Eleve o joelho até a altura do quadril, apoiado na ponta do outro pé.', pose: {
      hip: [100, 94], torso: 180, legs: [{ a: [95, 5] }, [100, 160]], feet: [[8, 5], [7, 7]], arms: [{ a: [-35, 50] }, { a: [40, 140] }], hl: ['leg0'],
      arrows: [down(150, 140, 110)] } },
    { caption: 'Troque de perna com ritmo, balançando os braços opostos. 2 x 15 m.', pose: {
      hip: [100, 94], torso: 180, legs: [[100, 160], { a: [95, 5] }], feet: [[7, 7], [8, 5]], arms: [{ a: [40, 140] }, { a: [-35, 50] }], hl: ['leg1'] } },
  ],
  'calcanhar-gluteo': [
    { caption: 'Trote curto levando o calcanhar em direção ao glúteo, tronco ereto.', pose: {
      hip: [100, 96], torso: 178, legs: [{ a: [10, -160] }, [100, 162]], feet: [[-8, 4], [7, 6]], arms: [{ a: [-30, 55] }, { a: [35, 130] }], hl: ['leg0'],
      arrows: [{ from: [100, 150], to: [84, 104], bend: 18 }] } },
    { caption: 'Alterne as pernas com ritmo. 2 x 15 m.', pose: {
      hip: [100, 96], torso: 178, legs: [[100, 162], { a: [10, -160] }], feet: [[7, 6], [-8, 4]], arms: [{ a: [35, 130] }, { a: [-30, 55] }], hl: ['leg1'] } },
  ],
  'circulos-quadril-tornozelo': [
    { caption: 'Em pé, tire um pé do chão e gire o tornozelo para os dois lados.', pose: stand(100, {
      arms: [{ a: [-30, 60] }, { a: [-25, 60] }], legs: [{ to: [124, 150] }, [100, A]], feet: [[9, 2], null], arrows: [{ c: [132, 152], r: 9 }] }) },
    { caption: 'Mãos na cintura: faça círculos amplos com o quadril, 8 a 10 para cada lado.', pose: {
      view: 'front', hip: [100, 98], torso: 180, arms: [{ a: [-40, 35] }, { a: [40, -35] }], legs: [[92, A], [108, A]],
      arrows: [{ c: [100, 100], r: 28, ry: 8 }] } },
  ],

  // ===================== ALONGAMENTO E MOBILIDADE =====================
  'along-panturrilha': [
    { caption: 'Mãos na parede, perna de trás esticada com o calcanhar no chão. Incline o tronco à frente e segure 30 s.', pose: {
      hip: [96, 106], torso: 150, arms: [[165, 70], [163, 73]], legs: [[64, 165], [122, A]], hl: ['leg0'], props: [{ t: 'wall', x: 166 }] } },
    { caption: 'Troque a perna. Sem dor: só uma tensão leve atrás da perna.', pose: {
      hip: [96, 106], torso: 150, arms: [[165, 70], [163, 73]], legs: [[122, A], [64, 165]], hl: ['leg1'], props: [{ t: 'wall', x: 166 }] } },
  ],
  'along-posterior': [
    { caption: 'Perna esticada apoiada num degrau baixo, a outra firme no chão.', pose: {
      hip: [78, 98], torso: 172, arms: [{ a: [8, 10] }, { a: [-4, -4] }], legs: [[134, 136], [78, A]], feet: [[3, -9], null], props: [box(126, 140, 50, 30)] } },
    { caption: 'Incline o tronco à frente com as costas retas até sentir a parte de trás da coxa. Segure 30 s.', pose: {
      hip: [78, 98], torso: 140, arms: [[112, 118], [108, 120]], legs: [[134, 136], [78, A]], feet: [[3, -9], null], hl: ['leg0'],
      props: [box(126, 140, 50, 30)], arrows: [{ from: [96, 40], to: [126, 58], bend: -8 }] } },
  ],
  'along-gluteo': [
    { caption: 'Deitado, cruze o tornozelo sobre o joelho da outra perna.', pose: supine({
      legs: [{ to: [116, 126], bend: 1 }, { a: [-165, 90] }], feet: [[6, -4], [2, -8]], arms: [{ a: [90, 90] }, { a: [90, 90] }] }) },
    { caption: 'Puxe a coxa de baixo em direção ao peito até sentir o glúteo alongar. Segure 30 s por lado.', pose: supine({
      legs: [{ to: [110, 120], bend: 1 }, { a: [-150, 100] }], feet: [[6, -4], [2, -8]], arms: [[106, 128], [104, 130]], hl: ['leg0'],
      arrows: [{ from: [150, 112], to: [126, 104], bend: -6 }] }) },
  ],
  'along-flexor-quadril': [
    { caption: 'Ajoelhe numa perna (toalha sob o joelho) e coloque a outra à frente.', pose: {
      hip: [98, 133], torso: 180, legs: [[64, 164], [140, 164]], feet: [[-9, 3], [10, 3]], arms: [{ a: [30, 70] }, { a: [35, 70] }],
      props: [{ t: 'towel', x: 98, y: 166 }] } },
    { caption: 'Aperte o glúteo e leve o quadril levemente à frente até sentir a frente da coxa. Segure 30 a 40 s.', pose: {
      hip: [106, 134], torso: 184, legs: [[64, 164], [140, 164]], feet: [[-9, 3], [10, 3]], arms: [{ a: [35, 70] }, { a: [40, 70] }], hl: ['leg0'],
      props: [{ t: 'towel', x: 98, y: 166 }], arrows: [fwd(112, 70, 94)] } },
  ],
  'mob-tornozelo': [
    { caption: 'Ajoelhado de frente para a parede, com o pé da frente perto dela.', pose: {
      hip: [100, 133], torso: 180, legs: [[70, 164], [128, 164]], feet: [[-9, 3], [10, 3]], arms: [[150, 100], [148, 103]], props: [{ t: 'wall', x: 152 }] } },
    { caption: 'Leve o joelho em direção à parede sem tirar o calcanhar do chão. Volte. 10 por perna.', pose: {
      hip: [110, 134], torso: 180, legs: [[70, 164], [128, 164]], feet: [[-9, 3], [10, 3]], arms: [[150, 100], [148, 103]], hl: ['leg1'],
      props: [{ t: 'wall', x: 152 }], arrows: [fwd(120, 124, 146)] } },
  ],
  'gato-camelo': [
    { caption: 'Em quatro apoios, arredonde as costas para cima, olhando para o umbigo.', pose: quad({ curve: -12, neck: 55, arrows: [down(98, 112, 92)] }) },
    { caption: 'Depois afunde suavemente as costas e olhe à frente. Alterne devagar.', pose: quad({ curve: 9, neck: 140, arrows: [down(98, 104, 124)] }) },
  ],
  'livro-aberto': [
    { caption: 'Visto de cima: deitado de lado, joelhos dobrados à frente e braços juntos.', pose: {
      floor: false, face: false, hip: [130, 95], torso: -90, arms: [{ a: [0, 0] }, { a: [3, 3] }], legs: [{ a: [0, 90] }, { a: [3, 90] }], feet: [[0, 6], [0, 6]],
      props: [{ t: 'mat', x: 20, y: 30, w: 180, h: 130 }] } },
    { caption: 'Abra o braço de cima como a página de um livro, acompanhando a mão com o olhar. Volte devagar. 8 por lado.', pose: {
      floor: false, face: false, hip: [130, 95], torso: -90, arms: [{ a: [180, 180] }, { a: [3, 3] }], legs: [{ a: [0, 90] }, { a: [3, 90] }], feet: [[0, 6], [0, 6]], hl: ['arm0'],
      props: [{ t: 'mat', x: 20, y: 30, w: 180, h: 130 }], arrows: [{ from: [100, 140], to: [100, 50], bend: 40 }] } },
  ],

  // ===================== POSTURA =====================
  'recuo-queixo': [
    { caption: 'Sentado, coluna alta, olhando à frente.', pose: seated({ neck: 165 }) },
    { caption: 'Leve o queixo para trás (como uma "papada") sem inclinar a cabeça. Segure 3 s.', pose: seated({
      neck: 186, props: [{ t: 'chair', x: 74, seat: 133, back: 92, w: 44 }, { t: 'line', from: [85, 56], to: [85, 100] }], arrows: [fwd(72, 108, 98)] }) },
  ],
  'anjo-parede': [
    { caption: 'Costas, cabeça e glúteo na parede. Braços em W, cotovelos e costas das mãos encostados.', pose: {
      view: 'front', hip: [110, 98], torso: 180, arms: [{ a: [-80, 180] }, { a: [80, 180] }], legs: [[102, A], [118, A]], props: [{ t: 'panel' }] } },
    { caption: 'Deslize os braços para cima até formar um Y, sem descolar as costas. Desça e repita.', pose: {
      view: 'front', hip: [110, 98], torso: 180, arms: [{ a: [-145, -160] }, { a: [145, 160] }], legs: [[102, A], [118, A]], hl: ['arm0', 'arm1'],
      props: [{ t: 'panel' }], arrows: [{ from: [64, 56], to: [70, 22] }, { from: [156, 56], to: [150, 22] }] } },
  ],
  'ext-toracica': [
    { caption: 'Sentado, mãos atrás da cabeça. Apoie o meio das costas na borda do encosto.', pose: {
      hip: [84, 129], torso: 180, arms: [[78, 72], [80, 70]], legs: [[122, 165], [119, 165]], props: [{ t: 'chair', x: 72, seat: 133, back: 108, w: 44 }] } },
    { caption: 'Incline para trás suavemente, olhando para cima. Só a parte média das costas, não a lombar.', pose: {
      hip: [84, 129], torso: 200, curve: 5, neck: 215, arms: [[60, 78], [62, 76]], legs: [[122, 165], [119, 165]],
      props: [{ t: 'chair', x: 72, seat: 133, back: 108, w: 44 }], arrows: [{ from: [96, 58], to: [64, 50], bend: -10 }] } },
  ],
  'along-peitoral': [
    { caption: 'Antebraço apoiado no batente da porta, cotovelo na altura do ombro.', pose: stand(101, {
      arms: [{ a: [90, 180] }, { a: [-5, -5] }], legs: [[104, A], [100, A]], props: [{ t: 'post', x: 128 }] }) },
    { caption: 'Dê um passo à frente e gire o tronco para o lado oposto até sentir o peito alongar. Segure 30 s.', pose: stand(151, {
      arms: [{ a: [-90, 180] }, { a: [-5, -5] }], legs: [[164, A], [136, A]], hl: ['arm0'], props: [{ t: 'post', x: 128 }], arrows: [fwd(150, 112, 146)] }) },
  ],
  'along-punhos': [
    { caption: 'Braço esticado à frente, palma para a frente: puxe os dedos para trás com a outra mão.', pose: stand(90, {
      arms: [{ a: [90, 90] }, [140, 50]], fingers: [180, null], hl: ['arm0'] }) },
    { caption: 'Depois palma para baixo: puxe a mão para baixo. 20 a 30 s em cada posição, dos dois lados.', pose: stand(90, {
      arms: [{ a: [90, 90] }, [139, 66]], fingers: [0, null], hl: ['arm0'] }) },
  ],
};

export const hasIllustration = (id: string) => !!illustrations[id];
