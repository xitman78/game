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
};

export type MoveData = {
  move: Move;
  color: Color;
  type: Type;
  from?: Vec;
  to?: Vec;
  capture?: Vec;
  promotion: Type;
};

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
  #moved = false;

  constructor(data: FigureData) {
    this.#color = data.color;
    this.#type = ref(data.type);
    this.#position = ref(new Vec(data.x, data.y));
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
    this.#moved = true;
  }

  get moved() {
    return this.#moved;
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
    if (figure.color !== this.turn) return false;
    if (x === undefined && y === undefined) return true;
    if (x === undefined || y === undefined) return false;
    if (x === figure.position.x && y === figure.position.y) return false;

    const dst = this.at(x, y);
    if (dst && dst.color === figure.color) return false;

    return true;
  }

  move(figure: Figure, x: number, y: number) {
    if (!this.canMove(figure, x, y)) return;
    const toRemove = this.at(x, y);
    if (toRemove) {
      this.remove(toRemove);
    }
    figure.position = new Vec(x, y);

    this.#turn.value = this.turn !== 'white' ? 'white' : 'black';
  }

  remove(figure: Figure) {
    const index = this.index(figure);
    if (index !== -1) {
      this.figures.splice(index, 1);
    }
  }

  index(figure: Figure) {
    return this.figures.findIndex(f => f === figure);
  }

  at(x: number, y: number) {
    for (const f of this.figures) {
      if (f.position.x === x && f.position.y === y) {
        return f;
      }
    }
    return undefined;
  }
}
