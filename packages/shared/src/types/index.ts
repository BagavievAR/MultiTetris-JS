export type User = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type GameResult = {
  score: number;
  date: string;
  opponent?: string;
};

export type Language = 'en' | 'ru';

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
}
