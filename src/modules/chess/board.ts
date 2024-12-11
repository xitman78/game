import { Vec } from '@/lib/bi';
import { Item, it } from '@/lib/reactive';
import { clamp } from '@/lib/std';
import { Figure, type Color, type Type } from '@/modules/chess/figures';
import { shallowReactive, watch } from 'vue';

const initialSetup: { color: Color, type: Type, x: number, y: number }[] = [
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
];

export class Board {
  readonly root: Item;
  readonly figures = shallowReactive<Figure[]>([]);
  readonly figuresLayer = it('g');

  constructor() {
    this.figures.push(...initialSetup.map(f => new Figure(f.color, f.type, f.x, f.y)));
    this.root = it('svg', { viewBox: '0 0 8 8', transform: 'scale(1 -1)' });

    const boardLayer = it('g');
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const color = (x & 1) === (y & 1) ? 'dark' : 'light';
        boardLayer.add(it('rect', { x, y, width: 1, height: 1, class: color }));
      }
    }

    this.root.add(boardLayer, this.figuresLayer);

    watch(this.figures, (figures) => {
      this.figuresLayer.clear();
      this.figuresLayer.add(...this.figures.map(figure => figure.shape));
    }, { immediate: true });

    this.root.on('pointerdown', this.#pick);
    this.root.on('pointermove', this.#drag);
    this.root.on('pointerup', this.#drop);

    // this.root.add(it('path', { class: 'black king' }));
  }

  #offset = new Vec();
  #dragging: Figure | undefined;

  #pos(e: PointerEvent) {
    const rect = this.root.element!.getBoundingClientRect();
    const w = rect.width / 8;
    const x = (e.clientX - rect.left) / w;
    const y = (rect.bottom - e.clientY) / w;
    return new Vec(x, y);
  }

  #pick = (e: PointerEvent) => {
    const { x, y } = this.#pos(e);
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const index = this.#findIndex(fx, fy);
    if (index === -1) return;

    this.#offset.x = x - fx;
    this.#offset.y = y - fy;

    const figure = this.figures[index];
    figure.shape.index = -1;

    this.#dragging = figure;
    this.root.element!.setPointerCapture(e.pointerId);
  };

  #drag = (e: PointerEvent) => {
    if (!this.#dragging) return;
    const { x, y } = this.#pos(e);
    const figure = this.#dragging;
    figure.shape.position = new Vec(
      x - this.#offset.x,
      y - this.#offset.y,
    );
  };

  #drop = (e: PointerEvent) => {
    if (!this.#dragging) return;
    const figure = this.#dragging;
    const { x, y } = this.#pos(e);
    const fx = clamp(Math.floor(x + 0.5 - this.#offset.x), 0, 7);
    const fy = clamp(Math.floor(y + 0.5 - this.#offset.y), 0, 7);
    this.move(figure.position.x, figure.position.y, fx, fy);
    figure.shape.position = figure.position;
    this.#dragging = undefined;
    this.root.element!.releasePointerCapture(e.pointerId);
  };

  reset() {
    this.figures.splice(0, Infinity, ...initialSetup.map(f => new Figure(f.color, f.type, f.x, f.y)));
  }

  canMove(x0: number, y0: number, x1: number, y1: number) {
    return true;
  }

  move(x0: number, y0: number, x1: number, y1: number) {
    if (!this.canMove(x0, y0, x1, y1)) {
      console.log(`Can not move: (${x0} ${y0}) (${x1} ${y1})`);
      return;
    }
    const index = this.#findIndex(x0, y0);
    if (index === -1) {
      console.log(`Not found: (${x0}, ${y0})`);
      return;
    }
    // console.log(`move: (${x0} ${y0}) (${x1} ${y1})`);
    const figure = this.figures[index];
    if (x0 !== x1 || y0 !== y1) {
      this.remove(x1, y1);
    }
    figure.position = new Vec(x1, y1);
  }

  remove(x: number, y: number) {
    const i = this.#findIndex(x, y);
    if (i !== -1) {
      // const f = this.figures[i];
      // console.log(`remove: ${f.color} ${f.type} ${f.position.x} ${f.position.y}`);
      this.figures.splice(i, 1);
    }
  }

  #findIndex(x: number, y: number) {
    return this.figures.findIndex(f => (f.position.x === x && f.position.y === y));
  }
}
