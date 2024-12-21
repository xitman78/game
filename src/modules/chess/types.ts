import type { Vec } from '@/lib/bi';

export type Color = 'white' | 'black';
export type Type = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type Move = 'normal' | 'capture' | 'en-passant' | 'king-castle' | 'queen-castle';

export type FigureData = {
  color: Color;
  type: Type;
  x: number;
  y: number;
  moved?: boolean;
  passable?: boolean;
};

export type MoveData = {
  remove?: Vec[];
  move?: { from: Vec; to: Vec }[];
};

export type Setup = {
  turn: Color;
  figures: FigureData[];
};

export type PickType = (color: Color) => Promise<Type>;
