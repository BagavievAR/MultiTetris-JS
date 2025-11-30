export type Cell = { x: number; y: number }

export type TetrominoShape = {
  colorId: number
  cells: Cell[]
  pivot: Cell
}

export const TETROMINOES: Record<string, TetrominoShape> = {
  I: {
    colorId: 1,
    cells: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    pivot: { x: 1.5, y: 1.5 },
  },

  O: {
    colorId: 4,
    cells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    pivot: { x: 1.5, y: 0.5 },
  },

  T: {
    colorId: 6,
    cells: [
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    pivot: { x: 1, y: 2 },
  },

  S: {
    colorId: 5,
    cells: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    pivot: { x: 1, y: 2 },
  },

  Z: {
    colorId: 7,
    cells: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    pivot: { x: 1, y: 2 },
  },

  J: {
    colorId: 2,
    cells: [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    pivot: { x: 1, y: 2 },
  },

  L: {
    colorId: 3,
    cells: [
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    pivot: { x: 1, y: 2 },
  },
}
