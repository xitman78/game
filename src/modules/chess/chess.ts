import { ref, shallowReactive, type Ref } from 'vue';
import { Vec } from '@/lib/bi';
import type { Color, FigureData, MoveData, Setup, Type } from '@/modules/chess/types';
import { Figure } from '@/modules/chess/figure';

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

export function remove(from: FigureData[], items: FigureData[]) {
  const result: FigureData[] = [...from];
  for (const { color, type } of items) {
    const index = result.findIndex(data => data.type === type && data.color === color);
    if (index !== -1) {
      result.splice(index, 1);
    }
  }
  return result;
}

export class Chess {
  readonly #setup: Setup;
  readonly #turn: Ref<Color> = ref('white');

  pick = (color: Color) => new Promise<Type>(resolve => resolve('queen'));
  win = (color: Color) => new Promise<void>(resolve => resolve());

  readonly figures = shallowReactive<Figure[]>([]);
  readonly removed = shallowReactive<Figure[]>([]);

  #enPassant: Vec | undefined;

  constructor(setup: Setup = defaultSetup) {
    this.#setup = setup;
    this.reset();
  }

  get turn() {
    return this.#turn.value;
  }

  get removedWhite() {
    return this.removed.filter(f => f.color === 'white');
  }

  get removedBlack() {
    return this.removed.filter(f => f.color === 'black');
  }

  reset() {
    this.figures.splice(0, Infinity, ...this.#setup.figures.map(f => new Figure(f)));
    this.removed.splice(0, Infinity, ...remove(defaultSetup.figures, this.#setup.figures).map(f => new Figure(f)));
    this.#turn.value = this.#setup.turn;
  }

  canMove(figure: Figure, x?: number, y?: number) {
    if (figure.color !== this.turn) return false;
    if (x === undefined && y === undefined) return true;
    if (x === undefined || y === undefined) return false;
    if (x === figure.position.x && y === figure.position.y) return false;

    const { x: fx, y: fy } = figure.position;
    return this.validMoves(figure).some(({ move }) => {
      return move.some(({ from, to }) => from.x === fx && from.y === fy && to.x === x && to.y === y);
    });
  }

  async move(figure: Figure, x: number, y: number) {
    if (figure.color !== this.turn) return;

    const { x: fx, y: fy } = figure.position;
    const data = this.validMoves(figure).find(({ move }) => (move.some(({ from, to }) => {
      return from.x === fx && from.y === fy && to.x === x && to.y === y;
    })));

    if (!data) return;

    await this.#applyAsync(data);
    if (this.#checkWin(this.turn)) {
      await this.win(this.turn);
    }

    this.#turn.value = this.turn !== 'white' ? 'white' : 'black';
  }

  #checkWin(color: Color) {
    let win = true;
    for (const f of this.figures) {
      if (f.color !== color && this.validMoves(f).length > 0) {
        win = false;
        break;
      }
    }
    return win;
  }

  at(x: number, y: number) {
    return this.figures.find(f => f.position.x === x && f.position.y === y);
  }

  allMoves(figure: Figure, check: boolean): MoveData[] {
    switch (figure.type) {
      case 'pawn': return this.#pawnMoves(figure);
      case 'rook': return this.#rookMoves(figure);
      case 'knight': return this.#knightMoves(figure);
      case 'bishop': return this.#bishopMoves(figure);
      case 'queen': return this.#queenMoves(figure);
      case 'king': return this.#kingMoves(figure, check);
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
      this.figures.forEach(f =>
        setup.figures.push({
          color: f.color,
          type: f.type,
          x: f.position.x,
          y: f.position.y,
          moved: f.moved,
          passable: f.passable,
        }),
      );
      const newState = new Chess(setup);
      newState.#apply(move);
      const newKing = newState.figures.find(f => f.color === king.color && f.type === 'king')!;
      return newState.#check(newKing).length === 0;
    });
  }

  #remove(remove: Vec[]) {
    remove.forEach((v) => {
      const index = this.figures.findIndex(f => f.position.x === v.x && f.position.y === v.y);
      if (index !== -1) {
        this.removed.push(...this.figures.splice(index, 1));
      }
    });
  }

  async #applyAsync({ remove, move }: MoveData) {
    this.#remove(remove);
    this.#enPassant = undefined;

    for (const { from, to } of move) {
      const index = this.figures.findIndex(f => f.position.x === from.x && f.position.y === from.y);
      if (index !== -1) {
        const figure = this.figures[index];
        figure.position = to;
        figure.moved = true;
        if (figure.type === 'pawn') {
          if (Math.abs(from.y - to.y) === 2) {
            this.#enPassant = to;
          }
          if (to.y === 0 || to.y === 7) {
            const type = await this.pick(this.turn);
            figure.type = type;
          }
        }
      }
    }
  }

  #apply({ remove, move }: MoveData) {
    this.#remove(remove);
    this.#enPassant = undefined;

    for (const { from, to } of move) {
      const index = this.figures.findIndex(f => f.position.x === from.x && f.position.y === from.y);
      if (index !== -1) {
        const figure = this.figures[index];
        figure.position = to;
        figure.moved = true;
        if (figure.type === 'pawn') {
          if (Math.abs(from.y - to.y) === 2) {
            this.#enPassant = to;
          }
        }
      }
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
      moves.push({ remove: [], move: [{ from: figure.position, to: new Vec(x, y1) }] });
      if (y === start && !this.at(x, y + 2 * dy)) {
        moves.push({ remove: [], move: [{ from: figure.position, to: new Vec(x, y + 2 * dy) }] });
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
          remove: [],
          move: [{ from: figure.position, to: new Vec(6, y) }, { from: rook7.position, to: new Vec(5, y) }],
        });
      }
      // queen castle
      const rook0 = this.at(0, y);
      if (rook0 && !rook0.moved && !this.at(1, y) && !this.at(2, y) && !this.at(3, y)) {
        moves.push({
          remove: [],
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
          moves.push({ remove: [], move: [{ from: figure.position, to: new Vec(x1, y1) }] });
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
        moves.push({ remove: [], move });
      }
    }
  }
}
