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
  #color: Color;
  #type: Ref<Type>;
  #position: Ref<Vec>;
  moved = false;
  passable = false;

  constructor(data: FigureData) {
    this.#color = data.color;
    this.#type = ref(data.type);
    this.#position = ref(new Vec(data.x, data.y));
    this.moved = data.moved || false;
    this.passable = data.passable || false;
  }

  get color() {
    return this.#color;
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
  readonly #turn: Ref<Color>;

  readonly figures = shallowReactive<Figure[]>([]);

  constructor(setup: Setup = defaultSetup) {
    this.#setup = setup;
    this.#turn = ref(this.#setup.turn);
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
    // if (figure.color !== this.turn) return false;
    if (x === undefined && y === undefined) return true;
    if (x === undefined || y === undefined) return false;
    if (x === figure.position.x && y === figure.position.y) return false;

    // return this.allMoves(figure).some(v => v.x === x && v.y === y);
    return this.validMoves(figure).some(v => v.x === x && v.y === y);
  }

  #step({ remove, move }: { remove?: Vec[]; move?: { from: Vec; to: Vec }[] }) {
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
          this.figures[index].position = to;
        }
      });
    }
  }

  move(figure: Figure, x: number, y: number) {
    if (!this.canMove(figure, x, y)) return;
    const toRemove = this.at(x, y);
    if (toRemove) {
      this.remove(toRemove);
    }
    figure.passable = figure.type === 'pawn' && Math.abs(y - figure.position.y) === 2;
    figure.position = new Vec(x, y);

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

  validMoves(figure: Figure) {
    const moves = this.allMoves(figure);
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
        if (f !== figure && (f.position.x !== move.x || f.position.y !== move.y)) {
          setup.figures.push({
            color: f.color,
            type: f.type,
            x: f.position.x,
            y: f.position.y,
            moved: f.moved,
            passable: f.passable,
          });
        }
        if (f === figure) {
          setup.figures.push({
            color: f.color,
            type: f.type,
            x: move.x,
            y: move.y,
            moved: true,
            passable: f.type === 'pawn' && Math.abs(move.y - f.position.y) === 2,
          });
        }
      });
      const newState = new Chess(setup);
      const newKing = newState.figures.find(f => f.color === king.color && f.type === 'king')!;
      return newState.#check(newKing).length === 0;
    });
  }

  allMoves(figure: Figure): Vec[] {
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
        return this.#kingMoves(figure);
    }
  }

  allMoves2(figure: Figure): MoveData[] {
    switch (figure.type) {
      case 'pawn': return this.#pawnMoves2(figure);
    }
    return [];
  }

  #pawnMoves2(figure: Figure): MoveData[] {
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

    // if (figure.color === 'white') {
    //   if (y + 1 < 8 && !this.at(x, y + 1)) {
    //     moves.push(new Vec(x, y + 1));
    //     if (y === 1 && !this.at(x, y + 2)) {
    //       moves.push(new Vec(x, y + 2));
    //     }
    //   }
    //   if (x - 1 >= 0 && y + 1 < 8) {
    //     const other = this.at(x - 1, y + 1);
    //     if (other && other.color !== figure.color) {
    //       moves.push(new Vec(x - 1, y + 1));
    //     }
    //   }
    //   if (x + 1 < 8 && y + 1 < 8) {
    //     const other = this.at(x + 1, y + 1);
    //     if (other && other.color !== figure.color) {
    //       moves.push(new Vec(x + 1, y + 1));
    //     }
    //   }
    // }
    // else {
    //   if (y - 1 >= 0 && !this.at(x, y - 1)) {
    //     moves.push(new Vec(x, y - 1));
    //     if (y === 6 && !this.at(x, y - 2)) {
    //       moves.push(new Vec(x, y - 2));
    //     }
    //   }
    //   if (x - 1 >= 0 && y - 1 >= 0) {
    //     const other = this.at(x - 1, y - 1);
    //     if (other && other.color !== figure.color) {
    //       moves.push(new Vec(x - 1, y - 1));
    //     }
    //   }
    //   if (x + 1 < 8 && y - 1 >= 0) {
    //     const other = this.at(x + 1, y - 1);
    //     if (other && other.color !== figure.color) {
    //       moves.push(new Vec(x + 1, y - 1));
    //     }
    //   }
    // }

    return moves;
  }

  #check(king: Figure) {
    const { x, y } = king.position;
    const figures: Figure[] = [];
    for (let i = 0; i < this.figures.length; ++i) {
      const figure = this.figures[i];
      if (figure.color !== king.color) {
        const moves = this.allMoves(figure);
        if (moves.some(v => v.x === x && v.y === y)) {
          figures.push(figure);
        }
      }
    }
    return figures;
  }

  #pawnMoves(figure: Figure) {
    const moves: Vec[] = [];
    const { x, y } = figure.position;

    if (figure.color === 'white') {
      if (y + 1 < 8 && !this.at(x, y + 1)) {
        moves.push(new Vec(x, y + 1));
        if (y === 1 && !this.at(x, y + 2)) {
          moves.push(new Vec(x, y + 2));
        }
      }
      if (x - 1 >= 0 && y + 1 < 8) {
        const other = this.at(x - 1, y + 1);
        if (other && other.color !== figure.color) {
          moves.push(new Vec(x - 1, y + 1));
        }
      }
      if (x + 1 < 8 && y + 1 < 8) {
        const other = this.at(x + 1, y + 1);
        if (other && other.color !== figure.color) {
          moves.push(new Vec(x + 1, y + 1));
        }
      }
    }
    else {
      if (y - 1 >= 0 && !this.at(x, y - 1)) {
        moves.push(new Vec(x, y - 1));
        if (y === 6 && !this.at(x, y - 2)) {
          moves.push(new Vec(x, y - 2));
        }
      }
      if (x - 1 >= 0 && y - 1 >= 0) {
        const other = this.at(x - 1, y - 1);
        if (other && other.color !== figure.color) {
          moves.push(new Vec(x - 1, y - 1));
        }
      }
      if (x + 1 < 8 && y - 1 >= 0) {
        const other = this.at(x + 1, y - 1);
        if (other && other.color !== figure.color) {
          moves.push(new Vec(x + 1, y - 1));
        }
      }
    }

    return moves;
  }

  #rookMoves(figure: Figure) {
    return this.#trace(figure, [[-1, 0], [1, 0], [0, 1], [0, -1]]);
  }

  #knightMoves(figure: Figure) {
    const { x, y } = figure.position;
    const moves: Vec[] = [];

    [-1, 1, -2, 2].forEach((dx) => {
      [Math.abs(dx) - 3, 3 - Math.abs(dx)].forEach((dy) => {
        this.#checkAndAdd(figure, x + dx, y + dy, moves);
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

  #kingMoves(figure: Figure) {
    const { x, y } = figure.position;
    const moves: Vec[] = [];

    for (let dx = -1; dx < 2; ++dx) {
      for (let dy = -1; dy < 2; ++dy) {
        this.#checkAndAdd(figure, x + dx, y + dy, moves);
      }
    }

    return moves;
  }

  #trace(figure: Figure, directions: [number, number][]) {
    const moves: Vec[] = [];
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
            moves.push(new Vec(x1, y1));
          }
          break;
        }
        else {
          moves.push(new Vec(x1, y1));
        }
      }
    });

    return moves;
  }

  #checkAndAdd(figure: Figure, x: number, y: number, moves: Vec[]) {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const other = this.at(x, y);
      if (!other || other.color !== figure.color) {
        moves.push(new Vec(x, y));
      }
    }
  }
}
