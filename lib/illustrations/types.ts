// Ilustrações dos exercícios: um boneco desenhado a partir de poses simples.
// Coordenadas: quadro de 220 x 180, chão em y = 170 (tornozelo em pé fica em y ≈ 166).
// Ângulos em graus: 0 = para baixo, 90 = para a frente (direita), 180 = para cima, -90 = para trás.

export type Pt = [number, number];

/** Braço ou perna: ponto final (mão/tornozelo), ponto + lado da dobra, ou ângulos [segmento 1, segmento 2]. */
export type Limb = Pt | { to: Pt; bend?: 1 | -1 } | { a: [number, number] };

export type Prop =
  | { t: 'box'; x: number; y: number; w: number; h: number }      // degrau / caixa (y = topo)
  | { t: 'wall'; x: number }                                      // parede vertical
  | { t: 'panel' }                                                // parede ao fundo (vista de frente)
  | { t: 'post'; x: number }                                      // batente / apoio vertical
  | { t: 'bar'; x1: number; x2: number; y: number }               // barra fixa
  | { t: 'table'; x1: number; x2: number; y: number }             // mesa
  | { t: 'chair'; x: number; seat: number; back: number; w: number }
  | { t: 'mat'; x: number; y: number; w: number; h: number }      // colchonete (vista de cima)
  | { t: 'towel'; x: number; y: number }
  | { t: 'line'; from: Pt; to: Pt };                              // linha guia tracejada

export type Arrow =
  | { from: Pt; to: Pt; bend?: number; label?: string }
  | { c: Pt; r: number; ry?: number; label?: string };            // seta circular (girar)

export type LimbKey = 'arm0' | 'arm1' | 'leg0' | 'leg1';

export type Pose = {
  /** side = de perfil (0 = lado de perto, 1 = lado de longe); front = de frente (0 = esquerda da tela) */
  view?: 'side' | 'front';
  hip: Pt;
  torso: number;
  /** curvatura das costas (negativo = arredondada para cima) */
  curve?: number;
  /** ângulo do pescoço (padrão: igual ao tronco) */
  neck?: number;
  arms: [Limb, Limb];
  legs: [Limb, Limb];
  /** ponta do pé em relação ao tornozelo */
  feet?: [Pt | null, Pt | null];
  /** dedos da mão (ângulo), para alongamento de punho */
  fingers?: [number | null, number | null];
  floor?: boolean;
  face?: boolean;
  /** membros destacados (o que se mexe) */
  hl?: LimbKey[];
  props?: Prop[];
  arrows?: Arrow[];
};

export type Frame = { caption: string; pose: Pose };
