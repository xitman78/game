import { Vec } from '@/lib/bi';
import { Item, fromSource, it } from '@/lib/reactive';
import { clamp, Disposable } from '@/lib/std';
import { Figure, type FigureData } from '@/modules/chess/figures';
import { shallowReactive, watch } from 'vue';

import scene from '@/assets/images/chess.svg?raw';

const initialSetup: FigureData[] = [
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
  readonly disposer = new Disposable();
  readonly root: Item;
  readonly board = shallowReactive<(Figure | undefined)[][]>([]);
  readonly figures = shallowReactive<Figure[]>([]);
  readonly figuresLayer = it('g');
  readonly watchers = new Map<Figure, () => void>();

  constructor() {
    // this.root = it('svg', { viewBox: '0 0 8 8', transform: 'scale(1 -1)' });
    this.root = fromSource(scene)!;
    this.root.attributes.viewBox = '0 0 8 8';
    // this.root.attributes.transform = 'scale(1 -1)';
    const b = this.root.find('board')!;

    for (let y = 0; y < 8; ++y) {
      const a: (Figure | undefined)[] = [];
      for (let x = 0; x < 8; ++x) {
        a.push(undefined);
      }
      this.board.push(a);
    }

    const boardLayer = it('g');
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const color = (x & 1) === (y & 1) ? 'dark' : 'light';
        boardLayer.add(it('rect', { x, y, width: 1, height: 1, class: color }));
      }
    }

    b.add(boardLayer, this.figuresLayer);
    this.root.add(b);
    this.root.on('pointerdown', this.#pick);
    this.root.on('pointermove', this.#drag);
    this.root.on('pointerup', this.#drop);
    // this.root.add(it('path', { class: 'black king' }));

    this.disposer.add(
      watch(
        () => [...this.figures],
        (cur, old) => {
          // unwatch removed figures
          old.forEach((f) => {
            if (!cur.includes(f)) {
              this.watchers.get(f)?.();
              this.watchers.delete(f);
              this.figuresLayer.remove(f.shape);
            }
          });
          // watch added figures
          cur.forEach((f) => {
            if (!old.includes(f)) {
              this.watchers.set(
                f,
                watch(
                  () => ({ x: f.position.x, y: f.position.y }),
                  (pos, old) => {
                    if (old) {
                      this.board[old.y][old.x] = undefined;
                      console.log(`move: (${old?.x} ${old?.y}) (${pos.x} ${pos.y})`);
                    }
                    this.board[pos.y][pos.x] = f;
                  },
                  { immediate: true },
                ),
              );
              this.figuresLayer.add(f.shape);
            }
          });
        },
      ),
    );

    this.reset();
  }

  dispose() {
    this.disposer.dispose();
    this.watchers.forEach(unwatch => unwatch());
  }

  reset() {
    this.figures.splice(0, Infinity, ...initialSetup.map(f => new Figure(f.color, f.type, f.x, f.y)));
  }

  canMove(figure: Figure, x: number, y: number) {
    return true;
  }

  move(figure: Figure, x: number, y: number) {
    const { x: fx, y: fy } = figure.position;
    if (!this.canMove(figure, x, y)) {
      console.log(`can not move: (${fx} ${fy}) (${x} ${y})`);
      return;
    }
    if (fx !== x || fy !== y) {
      this.remove(x, y);
    }
    figure.move(new Vec(x, y));
  }

  remove(x: number, y: number) {
    const i = this.#findIndex(x, y);
    if (i !== -1) {
      this.figures.splice(i, 1);
    }
  }

  #findIndex(x: number, y: number) {
    return this.figures.findIndex(f => (f.position.x === x && f.position.y === y));
  }

  #offset = new Vec();
  #selected: Figure | undefined;

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

    this.#offset.x = fx - x;
    this.#offset.y = fy - y;

    const figure = this.figures[index];
    figure.shape.index = -1;

    this.#selected = figure;
    this.root.element!.setPointerCapture(e.pointerId);
  };

  #drag = (e: PointerEvent) => {
    if (!this.#selected) return;
    const { x, y } = this.#pos(e);
    const figure = this.#selected;
    figure.shape.position = new Vec(
      x + this.#offset.x,
      y + this.#offset.y,
    );
  };

  #drop = (e: PointerEvent) => {
    if (!this.#selected) return;
    const figure = this.#selected;
    const { x, y } = this.#pos(e);
    const fx = clamp(Math.floor(x + 0.5 + this.#offset.x), 0, 7);
    const fy = clamp(Math.floor(y + 0.5 + this.#offset.y), 0, 7);
    this.move(figure, fx, fy);
    this.#selected = undefined;
    this.root.element!.releasePointerCapture(e.pointerId);
  };
}
