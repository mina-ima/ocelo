
export enum Player {
  Black = 'B',
  White = 'W',
}

export type CellState = Player | null;

export type Board = CellState[][];

export interface Scores {
  [Player.Black]: number;
  [Player.White]: number;
}

export interface Move {
  row: number;
  col: number;
}

export type GameMode = 'classic' | 'custom';

export interface CustomCharacters {
  [Player.Black]: string; // SVG data URI
  [Player.White]: string; // SVG data URI
}
