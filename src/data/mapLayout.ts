/**
 * Position of every caseta on /feria-map.webp, in the image's pixel space.
 * Open /gestion?debug=1 to draw numbered outlines and tune these values.
 */
export const MAP_WIDTH = 1168
export const MAP_HEIGHT = 806

export interface CasetaShape {
  number: number
  x: number
  y: number
  width: number
  height: number
  /** Rounded shapes (the two oval casetas, 11 and 134). */
  radius?: number
  /** Degrees, around the shape centre. */
  rotate?: number
}

type Rect = [number: number, x: number, y: number, width: number, height: number]

/** Splits a horizontal strip at the given x boundaries (left → right). */
function row(numbers: number[], edges: number[], y: number, height: number): Rect[] {
  return numbers.map((n, i) => [n, edges[i], y, edges[i + 1] - edges[i], height])
}

/** Splits a vertical strip at the given y boundaries (top → bottom). */
function column(numbers: number[], edges: number[], x: number, width: number): Rect[] {
  return numbers.map((n, i) => [n, x, edges[i], width, edges[i + 1] - edges[i]])
}

const range = (from: number, to: number) => {
  const step = from <= to ? 1 : -1
  return Array.from({ length: Math.abs(to - from) + 1 }, (_, i) => from + i * step)
}

// Inner blocks between La Paquera / Lola Flores and José Mercé / Moraito.
const L = 476 // left half of each block
const LM = 508
const LR = 545
const R = 568 // right half of each block
const RM = 600
const RR = 633

const RECTS: Rect[] = [
  // West, Paseo de las Palmeras (north side) 23 → 36
  ...row(range(23, 36), [91, 108, 127, 147, 171, 195, 219, 243, 268, 293, 318, 342, 366, 396, 428], 400, 29),
  // West, Paseo de las Palmeras (south side) 22 → 12
  ...row(range(22, 12), [89, 108, 132, 157, 181, 205, 229, 253, 278, 303, 328, 352], 472, 28),
  // La Paquera de Jerez column, 50 (north) → 37
  ...column(range(50, 37), [39, 63, 87, 112, 143, 170, 194, 218, 242, 267, 292, 316, 339, 364, 397], 397, 31),
  // Lola Flores column, 10 (north) → 1
  ...column(range(10, 1), [513, 537, 561, 585, 609, 633, 657, 681, 707, 737, 767], 397, 28),
  // José Mercé column, 123 (north) → 133
  ...column(range(123, 133), [74, 104, 129, 152, 175, 202, 234, 258, 280, 304, 336, 371], 680, 28),
  // East, Paseo de las Palmeras (north side) 160 → 167, 168 → 171
  ...row(range(160, 167), [722, 744, 770, 803, 832, 858, 885, 922, 956], 403, 26),
  ...row(range(168, 171), [965, 987, 1011, 1038, 1068], 403, 26),
  // East, Paseo de las Palmeras (south side) 175 → 172
  ...row(range(175, 172), [885, 950, 980, 1012, 1048], 474, 24),

  // Block "Tío Borrico" – "Antonio Chacón"
  [51, L, 72, LR - L, 28],
  [52, L, 100, LM - L, 31],
  [85, LM, 100, LR - LM, 31],
  [53, L, 131, LM - L, 24],
  [84, LM, 131, LR - LM, 24],
  [54, L, 155, LR - L, 25],
  [87, R, 76, RM - R, 42],
  [86, RM, 76, RR - RM, 32],
  [88, R, 118, RM - R, 25],
  [122, RM, 108, RR - RM, 35],
  [89, R, 143, RM - R, 37],
  [121, RM, 143, RR - RM, 37],

  // Block "Antonio Chacón" – "Terremoto de Jerez"
  [55, L, 200, LR - L, 25],
  [56, L, 225, LM - L, 33],
  [83, LM, 225, LR - LM, 22],
  [82, LM, 247, LR - LM, 17],
  [81, LM, 264, LR - LM, 20],
  [57, L, 258, LM - L, 27],
  [58, L, 285, LM - L, 25],
  [80, LM, 284, LR - LM, 26],
  [90, R, 200, RM - R, 28],
  [120, RM, 200, RR - RM, 22],
  [91, R, 228, RM - R, 30],
  [119, RM, 222, RR - RM, 22],
  [118, RM, 244, RR - RM, 22],
  [92, R, 258, RM - R, 27],
  [117, RM, 266, RR - RM, 22],
  [93, R, 285, RM - R, 25],
  [116, RM, 288, RR - RM, 22],

  // Block "Terremoto de Jerez" – Paseo de las Palmeras
  [59, L, 333, LM - L, 30],
  [79, LM, 333, LR - LM, 30],
  [60, L, 363, LR - L, 32],
  [61, L, 395, LM - L, 30],
  [78, LM, 395, LR - LM, 30],
  [94, R, 333, RM - R, 17],
  [95, R, 350, RM - R, 28],
  [96, R, 378, RM - R, 47],
  [115, RM, 333, RR - RM, 27],
  [114, RM, 360, RR - RM, 25],
  [113, RM, 385, RR - RM, 20],
  [112, RM, 405, RR - RM, 20],

  // Block Paseo de las Palmeras – "Manuel Moneo"
  [62, L, 472, LM - L, 25],
  [63, L, 497, LM - L, 23],
  [64, L, 520, LM - L, 23],
  [65, L, 543, LM - L, 24],
  [77, LM, 472, LR - LM, 68],
  [76, LM, 540, LR - LM, 27],
  [97, R, 475, RM - R, 33],
  [98, R, 508, RM - R, 32],
  [99, R, 540, RM - R, 27],
  [111, RM, 475, RR - RM, 33],
  [110, RM, 508, RR - RM, 29],
  [109, RM, 537, RR - RM, 30],

  // Block "Manuel Moneo" – "Antonio Nuñez Chocolate"
  [66, L, 598, LM - L, 27],
  [67, L, 625, LM - L, 25],
  [68, L, 650, LM - L, 25],
  [69, L, 675, LM - L, 23],
  [70, L, 698, LM - L, 20],
  [71, L, 718, LM - L, 15],
  [75, LM, 598, LR - LM, 32],
  [74, LM, 630, LR - LM, 30],
  [73, LM, 660, LR - LM, 30],
  [72, LM, 690, LR - LM, 43],
  [100, R, 598, RM - R, 27],
  [101, R, 625, RM - R, 23],
  [102, R, 648, RM - R, 20],
  [103, R, 668, RM - R, 18],
  [104, R, 686, RM - R, 19],
  [108, RM, 598, RR - RM, 27],
  [107, RM, 625, RR - RM, 25],
  [106, RM, 650, RR - RM, 28],
  [105, RM, 678, RR - RM, 27],

  // East blocks between Moraito, Angelita Gómez and La Macanita
  [135, 678, 472, 32, 43],
  [146, 710, 472, 32, 53],
  [136, 678, 515, 32, 30],
  [145, 710, 525, 32, 20],
  [137, 678, 545, 32, 25],
  [144, 710, 545, 32, 25],
  [147, 770, 470, 33, 38],
  [159, 803, 470, 32, 38],
  [148, 770, 508, 33, 37],
  [158, 803, 508, 32, 20],
  [157, 803, 528, 32, 17],
  [149, 770, 545, 33, 25],
  [156, 803, 545, 32, 25],
  [138, 678, 595, 32, 25],
  [139, 678, 620, 32, 20],
  [140, 678, 640, 32, 58],
  [143, 710, 595, 32, 40],
  [142, 710, 635, 32, 30],
  [141, 710, 665, 32, 23],
  [150, 770, 598, 33, 22],
  [155, 803, 598, 32, 22],
  [151, 770, 620, 33, 23],
  [154, 803, 620, 32, 23],
  [153, 770, 644, 63, 24],
  [152, 770, 668, 25, 22],
]

const OVALS: CasetaShape[] = [
  { number: 11, x: 374, y: 471, width: 30, height: 44, radius: 15, rotate: -35 },
  { number: 134, x: 682, y: 383, width: 30, height: 46, radius: 15, rotate: -45 },
]

export const CASETA_SHAPES: CasetaShape[] = [
  ...RECTS.map(([number, x, y, width, height]) => ({ number, x, y, width, height })),
  ...OVALS,
].sort((a, b) => a.number - b.number)
