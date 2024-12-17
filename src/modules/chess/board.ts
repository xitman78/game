import { watch } from 'vue';
import { Vec } from '@/lib/bi';
import { Item, fromSource, it } from '@/lib/reactive';
import { clamp, Disposable } from '@/lib/std';
import { Transformable } from '@/lib/svg/transformable';
import { Chess, Figure, pos } from '@/modules/chess/chess';

import scene from '@/assets/images/chess.svg?raw';

export class Shape extends Transformable {
  readonly #disposer = new Disposable();

  constructor(figure: Figure) {
    const scale = 1 / 8; // all shape images have size 8x8
    const cssColor = figure.color;
    const cssType = figure.type;
    const shapeId = figure.type;
    // const shadowColor = figure.color === 'white' ? 'black' : 'white';
    // const blur = 0.3;
    super('g', {
      class: `${cssColor} ${cssType}`,
      // filter: `drop-shadow(0 0 ${blur}px ${shadowColor})`,
      filter: `url(#${cssColor}-shadow)`,
    });
    this.scale = new Vec(scale, scale);
    const use = it('use', { href: `#${shapeId}` });
    this.add(use);
    this.#disposer.add(
      watch(
        () => ({ x: figure.position.x, y: figure.position.y }),
        () => this.position = figure.position,
        { immediate: true },
      ),
    );
  }

  dispose() {
    this.#disposer.dispose();
  }
}

export class Board {
  readonly disposer = new Disposable();
  readonly root: Item;
  readonly figuresLayer = it('g');

  readonly chess: Chess;
  readonly shapes = new Map<Figure, Shape>();

  constructor(chess: Chess) {
    this.chess = chess;
    this.root = fromSource(scene)!;
    this.root.attributes.viewBox = '0 0 8 8';
    const board = this.root.find('board')!;

    const boardLayer = it('g');
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const color = (x & 1) === (y & 1) ? 'dark' : 'light';
        boardLayer.add(it('rect', { x, y, width: 1, height: 1, class: color }));
      }
    }

    board.add(boardLayer, this.figuresLayer);
    this.root.add(board);
    this.root.on('pointerdown', this.#pick);
    this.root.on('pointermove', this.#drag);
    this.root.on('pointerup', this.#drop);

    this.disposer.add(
      watch(
        () => [...chess.figures],
        (cur, old) => {
          // unwatch removed figures
          old?.forEach((f) => {
            if (!cur.includes(f)) {
              const shape = this.shapes.get(f)!;
              shape.dispose();
              this.figuresLayer.remove(shape);
              this.shapes.delete(f);
            }
          });
          cur.forEach((f) => {
            if (!old?.includes(f)) {
              const shape = new Shape(f);
              this.shapes.set(f, shape);
              this.figuresLayer.add(shape);
            }
          });
        },
        { immediate: true },
      ),
    );
  }

  dispose() {
    this.disposer.dispose();
    this.shapes.forEach(shape => shape.dispose());
  }

  #offset = new Vec();
  #selectedFigure: Figure | undefined;

  #pos(e: MouseEvent) {
    const rect = this.root.element!.getBoundingClientRect();
    const w = rect.width / 8;
    const x = (e.clientX - rect.left) / w;
    const y = (rect.bottom - e.clientY) / w;
    return new Vec(x, y);
  }

  #pick = (e: PointerEvent) => {
    const { x: ex, y: ey } = this.#pos(e);
    const x = Math.floor(ex);
    const y = Math.floor(ey);
    const figure = this.chess.at(x, y);
    if (!figure || !this.chess.canMove(figure)) return;

    const all = this.chess.allMoves(figure).map((data) => {
      if (data.move) {
        return data.move.filter(({ from }) => from.x === x && from.y === y).map(({ to }) => `${pos(to)}`).join(' ');
      }
      else {
        return '';
      }
    }).join(' ');
    const valid = this.chess.validMoves(figure).map((data) => {
      if (data.move) {
        return data.move.filter(({ from }) => from.x === x && from.y === y).map(({ to }) => `${pos(to)}`).join(' ');
      }
      else {
        return '';
      }
    }).join(' ');
    console.log(`${figure.color} ${figure.type} ${pos(figure.position)}\n\tmoves: ${all}\n\tvalid: ${valid}`);

    this.#offset.x = x - ex;
    this.#offset.y = y - ey;

    this.#selectedFigure = figure;
    const shape = this.shapes.get(figure)!;
    shape.index = -1; // move to top
    this.root.element!.setPointerCapture(e.pointerId);
  };

  #drag = (e: PointerEvent) => {
    if (!this.#selectedFigure) return;
    const { x, y } = this.#pos(e);
    const shape = this.shapes.get(this.#selectedFigure)!;
    shape.position = new Vec(x + this.#offset.x, y + this.#offset.y);
  };

  #drop = (e: PointerEvent) => {
    if (!this.#selectedFigure) return;
    const { x, y } = this.#pos(e);
    const fx = clamp(Math.floor(x + 0.5 + this.#offset.x), 0, 7);
    const fy = clamp(Math.floor(y + 0.5 + this.#offset.y), 0, 7);
    if (this.chess.canMove(this.#selectedFigure, fx, fy)) {
      this.chess.move(this.#selectedFigure, fx, fy);
    }
    else {
      this.shapes.get(this.#selectedFigure)!.position = this.#selectedFigure.position;
    }
    this.#selectedFigure = undefined;
    this.root.element!.releasePointerCapture(e.pointerId);
  };
}
