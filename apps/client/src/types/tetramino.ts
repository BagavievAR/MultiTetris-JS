export enum CellColorId {
  Empty = 0,
  Cyan,
  Blue,
  Orange,
  Yellow,
  Green,
  Purple,
  Red,
}

export interface TetrominoCell {
  x: number
  y: number
}

export interface Tetromino {
  cells: TetrominoCell[]
  colorId: CellColorId
  pivot: { x: number; y: number }
}

export interface TetrominoShape {
  colorId: CellColorId;
  cells: { x: number; y: number }[];
  pivot: { x: number; y: number };
}