import { ref, shallowReactive, type Ref } from 'vue';
import { Vec } from '@/lib/bi';

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

export function pos(v: Vec) {
  const letters = 'abcdefgh';
  return `${letters[v.x]}${v.y + 1}`;
}

export type Setup = {
  turn: Color;
  figures: FigureData[];
};

export const defaultSetup: Setup = {
  turn: 'white',
  figures: [
    { color: 'white', type: 'rook', x: 0, y: 0 },
    { color: 'white', type: 'knight', x: 1, y: 0 },
    { color: 'white', type: 'bishop', x: 2, y: 0 },
    { color: 'white', type: 'queen', x: 3, y: 0 },
    { color: 'white', type: 'king', x: 4, y: 0 },
    { color: 'white', type: 'bishop', x: 5, y: 0 },
    { color: 'white', type: 'knight', x: 6, y: 0 },
    { color: 'white', type: 'rook', x: 7, y: 0 },
    { color: 'white', type: 'pawn', x: 0, y: 1 },
    { color: 'white', type: 'pawn', x: 1, y: 1 },
    { color: 'white', type: 'pawn', x: 2, y: 1 },
    { color: 'white', type: 'pawn', x: 3, y: 1 },
    { color: 'white', type: 'pawn', x: 4, y: 1 },
    { color: 'white', type: 'pawn', x: 5, y: 1 },
    { color: 'white', type: 'pawn', x: 6, y: 1 },
    { color: 'white', type: 'pawn', x: 7, y: 1 },
    { color: 'black', type: 'rook', x: 0, y: 7 },
    { color: 'black', type: 'knight', x: 1, y: 7 },
    { color: 'black', type: 'bishop', x: 2, y: 7 },
    { color: 'black', type: 'queen', x: 3, y: 7 },
    { color: 'black', type: 'king', x: 4, y: 7 },
    { color: 'black', type: 'bishop', x: 5, y: 7 },
    { color: 'black', type: 'knight', x: 6, y: 7 },
    { color: 'black', type: 'rook', x: 7, y: 7 },
    { color: 'black', type: 'pawn', x: 0, y: 6 },
    { color: 'black', type: 'pawn', x: 1, y: 6 },
    { color: 'black', type: 'pawn', x: 2, y: 6 },
    { color: 'black', type: 'pawn', x: 3, y: 6 },
    { color: 'black', type: 'pawn', x: 4, y: 6 },
    { color: 'black', type: 'pawn', x: 5, y: 6 },
    { color: 'black', type: 'pawn', x: 6, y: 6 },
    { color: 'black', type: 'pawn', x: 7, y: 6 },
  ],
};

export class Figure {
  #color: Ref<Color> = ref('white');
  #type: Ref<Type>;
  #position: Ref<Vec>;
  moved = false;
  passable = false;

  constructor(data: FigureData) {
    this.color = data.color;
    this.#type = ref(data.type);
    this.#position = ref(new Vec(data.x, data.y));
    this.moved = data.moved || false;
    this.passable = data.passable || false;
  }

  get color() {
    return this.#color.value;
  }

  set color(value) {
    this.#color.value = value;
  }

  get type() {
    return this.#type.value;
  }

  // pawn can change it's type
  set type(value) {
    this.#type.value = value;
  }

  get position() {
    return this.#position.value;
  }

  set position(value) {
    this.#position.value = value;
  }
}

export class Chess {
  readonly #setup: Setup;
  readonly #turn: Ref<Color> = ref('white');

  readonly figures = shallowReactive<Figure[]>([]);

  #enPassant: Vec | undefined;

  constructor(setup: Setup = defaultSetup) {
    this.#setup = setup;
    this.reset();
  }

  get turn() {
    return this.#turn.value;
  }

  reset() {
    this.figures.splice(0, Infinity, ...this.#setup.figures.map(f => new Figure(f)));
    this.#turn.value = this.#setup.turn;
  }

  canMove(figure: Figure, x?: number, y?: number) {
    if (figure.color !== this.turn) return false;
    if (x === undefined && y === undefined) return true;
    if (x === undefined || y === undefined) return false;
    if (x === figure.position.x && y === figure.position.y) return false;

    const { x: fx, y: fy } = figure.position;
    return this.validMoves(figure).some(({ move }) => {
      return move && move.some(({ from, to }) => from.x === fx && from.y === fy && to.x === x && to.y === y);
    });
  }

  move(figure: Figure, x: number, y: number) {
    const { x: fx, y: fy } = figure.position;
    const data = this.validMoves(figure).find(({ move }) => (move && move.some(({ from, to }) => {
      return from.x === fx && from.y === fy && to.x === x && to.y === y;
    })));

    if (!data) return;

    this.#apply(data);
    this.#turn.value = this.turn !== 'white' ? 'white' : 'black';
  }

  remove(figure: Figure) {
    const index = this.figures.findIndex(f => f === figure);
    if (index !== -1) {
      this.figures.splice(index, 1);
    }
  }

  at(x: number, y: number) {
    for (const f of this.figures) {
      if (f.position.x === x && f.position.y === y) {
        return f;
      }
    }
    return undefined;
  }

  allMoves(figure: Figure, check: boolean): MoveData[] {
    switch (figure.type) {
      case 'pawn':
        return this.#pawnMoves(figure);
      case 'rook':
        return this.#rookMoves(figure);
      case 'knight':
        return this.#knightMoves(figure);
      case 'bishop':
        return this.#bishopMoves(figure);
      case 'queen':
        return this.#queenMoves(figure);
      case 'king':
        return this.#kingMoves(figure, check);
    }
  }

  validMoves(figure: Figure) {
    const moves = this.allMoves(figure, true);
    const color = figure.color;
    const king = this.figures.find(f => f.color === color && f.type === 'king');
    if (!king) {
      return moves;
    }

    return moves.filter((move) => {
      const nextColor: Color = color === 'white' ? 'black' : 'white';
      const setup: Setup = {
        turn: nextColor,
        figures: [],
      };
      this.figures.forEach((f) => {
        setup.figures.push({
          color: f.color,
          type: f.type,
          x: f.position.x,
          y: f.position.y,
          moved: f.moved,
          passable: f.passable,
        });
      });
      const newState = new Chess(setup);
      newState.#apply(move);
      const newKing = newState.figures.find(f => f.color === king.color && f.type === 'king')!;
      return newState.#check(newKing).length === 0;
    });
  }

  #apply({ remove, move }: MoveData) {
    if (remove) {
      remove.forEach((v) => {
        const index = this.figures.findIndex(f => f.position.x === v.x && f.position.y === v.y);
        if (index !== -1) {
          this.figures.splice(index, 1);
        }
      });
    }
    if (move) {
      move.forEach(({ from, to }) => {
        const index = this.figures.findIndex(f => f.position.x === from.x && f.position.y === from.y);
        if (index !== -1) {
          const figure = this.figures[index];
          figure.position = to;
          figure.moved = true;
          if (figure.type === 'pawn' && Math.abs(from.y - to.y) === 2) {
            this.#enPassant = to;
          }
          else {
            this.#enPassant = undefined;
          }
        }
      });
    }
  }

  #pawnMoves(figure: Figure): MoveData[] {
    const moves: MoveData[] = [];
    const { x, y } = figure.position;

    const start = figure.color === 'white' ? 1 : 6;
    const dy = figure.color === 'white' ? 1 : -1;

    const y1 = y + dy;

    if (y1 < 0 && y1 > 7) {
      return [];
    }

    if (!this.at(x, y1)) {
      moves.push({ move: [{ from: figure.position, to: new Vec(x, y1) }] });
      if (y === start && !this.at(x, y + 2 * dy)) {
        moves.push({ move: [{ from: figure.position, to: new Vec(x, y + 2 * dy) }] });
      }
    }

    [-1, 1].forEach((dx) => {
      const x1 = x + dx;
      if (x1 >= 0 && x1 < 8) {
        const other = this.at(x1, y1);
        if (other && other.color !== figure.color) {
          moves.push({
            remove: [new Vec(x1, y1)],
            move: [{ from: figure.position, to: new Vec(x1, y1) }],
          });
        }
      }
    });

    if (this.#enPassant) {
      const p = this.#enPassant;
      if (p.y === y && Math.abs(p.x - x) === 1 && !this.at(p.x, p.y + dy)) {
        moves.push({
          remove: [p],
          move: [{ from: figure.position, to: new Vec(p.x, p.y + dy) }],
        });
      }
    }

    return moves;
  }

  #rookMoves(figure: Figure) {
    return this.#trace(figure, [[-1, 0], [1, 0], [0, 1], [0, -1]]);
  }

  #knightMoves(figure: Figure) {
    const { x, y } = figure.position;
    const moves: MoveData[] = [];

    [-1, 1, -2, 2].forEach((dx) => {
      [Math.abs(dx) - 3, 3 - Math.abs(dx)].forEach((dy) => {
        this.#addMove(figure, x + dx, y + dy, moves);
      });
    });

    return moves;
  }

  #bishopMoves(figure: Figure) {
    return this.#trace(figure, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
  }

  #queenMoves(figure: Figure) {
    return this.#trace(figure, [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, -1], [-1, 1], [1, -1], [1, 1]]);
  }

  #kingMoves(figure: Figure, check: boolean) {
    const { x, y } = figure.position;
    const moves: MoveData[] = [];

    for (let dx = -1; dx < 2; ++dx) {
      for (let dy = -1; dy < 2; ++dy) {
        if (dx !== 0 || dy !== 0) {
          this.#addMove(figure, x + dx, y + dy, moves);
        }
      }
    }

    if (check && this.#check(figure).length > 0) {
      return moves;
    }

    if (!figure.moved) {
      // king castle
      const rook7 = this.at(7, y);
      if (rook7 && !rook7.moved && !this.at(5, y) && !this.at(6, y)) {
        moves.push({
          move: [{ from: figure.position, to: new Vec(6, y) }, { from: rook7.position, to: new Vec(5, y) }],
        });
      }
      // queen castle
      const rook0 = this.at(0, y);
      if (rook0 && !rook0.moved && !this.at(1, y) && !this.at(2, y) && !this.at(3, y)) {
        moves.push({
          move: [{ from: figure.position, to: new Vec(2, y) }, { from: rook0.position, to: new Vec(3, y) }],
        });
      }
    }

    return moves;
  }

  #check(king: Figure) {
    const { x, y } = king.position;
    const figures: Figure[] = [];
    this.figures.forEach((figure) => {
      if (figure.color !== king.color) {
        const moves = this.allMoves(figure, false);
        if (moves.some(m => m.remove?.some(v => v.x === x && v.y === y))) {
          figures.push(figure);
        }
      }
    });
    return figures;
  }

  #trace(figure: Figure, directions: [number, number][]) {
    const moves: MoveData[] = [];
    const { x, y } = figure.position;

    directions.forEach(([dx, dy]) => {
      let x1 = x;
      let y1 = y;
      while (true) {
        x1 += dx;
        y1 += dy;
        if (x1 < 0 || x1 > 7 || y1 < 0 || y1 > 7) break;
        const other = this.at(x1, y1);
        if (other) {
          if (other.color !== figure.color) {
            moves.push({
              remove: [new Vec(x1, y1)],
              move: [{ from: figure.position, to: new Vec(x1, y1) }],
            });
          }
          break;
        }
        else {
          moves.push({ move: [{ from: figure.position, to: new Vec(x1, y1) }] });
        }
      }
    });

    return moves;
  }

  #addMove(figure: Figure, x: number, y: number, moves: MoveData[]) {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const other = this.at(x, y);
      const move: { from: Vec; to: Vec }[] = [{ from: figure.position, to: new Vec(x, y) }];
      if (other && other.color !== figure.color) {
        moves.push({ remove: [new Vec(x, y)], move });
      }
      else if (!other) {
        moves.push({ move });
      }
    }
  }
}
