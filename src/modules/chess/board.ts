import scene from '@/assets/images/chess.svg?raw';

import { watch } from 'vue';
import { Vec } from '@/lib/bi';
import { Item, fromSource, it, type Attributes } from '@/lib/reactive';
import { Buttons, clamp, Disposable } from '@/lib/std';
import { Chess } from '@/modules/chess/chess';
import { Shape } from '@/modules/chess/shape';
import type { Figure } from '@/modules/chess/figure';
import { RemovedFigures } from '@/modules/chess/removed-figures';
import { Picker } from '@/modules/chess/picker';
import { ExplicitPromise } from '@/lib/async';
import type { Color, Type } from '@/modules/chess/types';
import { Transformable } from '@/lib/svg/transformable';
import { Camera } from '@/lib/svg/camera';
import { Controller } from '@/lib/svg/controller';

export class Selection {
  #chess: Chess;
  #parent: Item;
  #figure?: Figure;

  constructor(chess: Chess, parent: Item) {
    this.#chess = chess;
    this.#parent = parent;
  }

  get figure() {
    return this.#figure;
  }

  set figure(value) {
    this.#figure = value;
    this.#parent.clear();
    if (!this.#figure) return;

    const { x, y } = this.#figure.position;
    const moves = this.#chess.validMoves(this.#figure)
      .map(data => data.move.filter(({ from }) => from.x === x && from.y === y))
      .flat()
      .map(({ to }) => to);
    this.#parent.add(...moves.map((to) => {
      const g = new Transformable('g', { class: 'highlighted-cell' }, [it('use', { href: '#mark' })]);
      g.scale = new Vec(0.125, 0.125);
      g.position = to;
      return g;
    }));
  }
}

export class Board {
  readonly root: Item;

  readonly #chess: Chess;

  readonly #disposer = new Disposable();

  readonly #grid: Item[] = [];

  readonly #figures: Item;
  readonly #shapes = new Map<Figure, Shape>();
  readonly #removedWhite: RemovedFigures;
  readonly #removedBlack: RemovedFigures;
  readonly #picker = new Picker(() => new ExplicitPromise<Type>(() => {}));
  readonly #pickWhite: Item;
  readonly #pickBlack: Item;
  readonly #selection: Selection;

  readonly camera: Camera;
  readonly controller: Controller;

  constructor(chess: Chess) {
    this.#chess = chess;
    this.#chess.pick = this.#pickType;
    this.#removedWhite = new RemovedFigures(() => this.#chess.removedWhite);
    this.#removedBlack = new RemovedFigures(() => this.#chess.removedBlack);
    this.root = fromSource(scene)!;
    this.#figures = this.root.find('board-figures')!;
    this.root.find('removed-white')!.add(this.#removedWhite.root);
    this.root.find('removed-black')!.add(this.#removedBlack.root);
    this.#pickWhite = this.root.find('pick-white')!;
    this.#pickBlack = this.root.find('pick-black')!;
    this.#selection = new Selection(chess, this.root.find('board-selection')!);

    this.camera = new Camera({
      position: new Vec(4.5, 5),
      scale: new Vec(1, -1),
    });
    this.controller = new Controller(this.root, this.root.find('scene')!, this.camera, {
      width: 9,
      height: 10,
    });

    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const color = (x & 1) === (y & 1) ? 'dark' : 'light';
        this.#grid.push(it('rect', { x, y, width: 1, height: 1, class: color }));
      }
    }
    this.root.find('board-grid')!.add(...this.#grid);

    this.root.on('pointerdown', this.#pick);
    this.root.on('pointermove', this.#drag);
    this.root.on('pointerup', this.#drop);

    this.#disposer.add(
      watch(
        () => [...chess.figures],
        (cur, old) => {
          this.#selection.figure = undefined;
          // unwatch removed figures
          old?.forEach((f) => {
            if (!cur.includes(f)) {
              const shape = this.#shapes.get(f)!;
              shape.dispose();
              this.#figures.remove(shape);
              this.#shapes.delete(f);
            }
          });
          cur.forEach((f) => {
            if (!old?.includes(f)) {
              const shape = new Shape(f);
              this.#shapes.set(f, shape);
              this.#figures.add(shape);
            }
          });
        },
        { immediate: true },
      ),
      () => {
        this.#shapes.forEach(shape => shape.dispose());
      },
    );
  }

  dispose() {
    this.#disposer.dispose();
  }

  mount(element: HTMLElement) {
    this.controller.mount(element);
  }

  unmount() {
    this.controller.unmount();
  }

  #lockCount = 0;
  #lock() {
    ++this.#lockCount;
  }

  #unlock() {
    --this.#lockCount;
  }

  get #locked() {
    return this.#lockCount > 0;
  }

  #pickType = async (color: Color) => {
    const parent = color === 'white' ? this.#pickWhite : this.#pickBlack;
    parent.add(this.#picker.root);
    this.#lock();
    const type = await this.#picker.pick(color);
    this.#unlock();
    parent.remove(this.#picker.root);
    return type;
  };

  #pos(e: MouseEvent) {
    const rect = this.root.element!.getBoundingClientRect();
    const w = rect.width / 9;
    const h = rect.height / 10;
    const x = (e.clientX - rect.left) / w - 0.5;
    const y = (rect.bottom - e.clientY) / h - 1;
    return new Vec(x, y);
  }

  #printMoves(figure?: Figure) {
    if (!figure) return;

    const { x, y } = figure.position;
    const pos = (v: Vec) => `${'abcdefgh'[v.x]}${v.y + 1}`;
    const all = this.#chess.allMoves(figure, false).map(data =>
      data.move
        .filter(({ from }) => from.x === x && from.y === y)
        .map(({ to }) => `${pos(to)}`).join(' ')).join(' ');
    const valid = this.#chess.validMoves(figure).map(data =>
      data.move
        .filter(({ from }) => from.x === x && from.y === y)
        .map(({ to }) => `${pos(to)}`).join(' ')).join(' ');
    console.log(`${figure.color} ${figure.type} ${pos(figure.position)}\n\tmoves: ${all}\n\tvalid: ${valid}`);
  }

  #pick = async (e: PointerEvent) => {
    if (this.#locked) return;

    const { x, y } = this.#pos(e);
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const figure = this.#chess.at(fx, fy);
    // this.#printMoves(figure);

    const selected = this.#selection.figure;
    if (selected && this.#chess.canMove(selected, fx, fy)) {
      this.#selection.figure = undefined;
      await this.#chess.move(selected, fx, fy);
      this.#shapes.get(selected)!.position = selected.position;
      return;
    }
    else if (figure?.color === this.#chess.turn) {
      this.#selection.figure = figure;
    }

    if (!figure) return;
    const shape = this.#shapes.get(figure)!;
    shape.index = -1; // move to top
    this.root.element!.setPointerCapture(e.pointerId);
  };

  #drag = (e: PointerEvent) => {
    if (this.#locked) return;
    const { x, y } = this.#pos(e);
    this.#highlight(Math.floor(x), Math.floor(y));
    if (!this.#selection.figure || !(e.buttons & Buttons.LEFT)) return;
    const shape = this.#shapes.get(this.#selection.figure)!;
    shape.position = new Vec(clamp(x, 0, 8) - 0.5, clamp(y, 0, 8) - 0.5);
  };

  #drop = async (e: PointerEvent) => {
    if (this.#locked) return;
    if (!this.#selection.figure) return;
    this.root.element!.releasePointerCapture(e.pointerId);

    const { x, y } = this.#pos(e);
    const fx = Math.floor(x);
    const fy = Math.floor(y);

    const figure = this.#selection.figure;

    if (figure.position.x === fx && figure.position.y === fy) {
      this.#shapes.get(figure)!.position = figure.position;
      return;
    }

    this.#selection.figure = undefined;
    await this.#chess.move(figure, fx, fy);
    this.#shapes.get(figure)!.position = figure.position;
  };

  #addClass(attributes: Attributes, name: string) {
    const classes = attributes.class?.split(' ') || [];
    if (!classes.includes(name)) {
      classes.push(name);
      attributes.class = classes.join(' ');
    }
  }

  #removeClass(attributes: Attributes, name: string) {
    const classes = attributes.class?.split(' ') || [];
    const index = classes.findIndex(c => c === name);
    if (index !== -1) {
      classes.splice(index, 1);
      attributes.class = classes.join(' ');
    }
  }

  #hover: Item | undefined;
  #highlight(x: number, y: number) {
    if (this.#hover) {
      this.#removeClass(this.#hover.attributes, 'hover');
    }
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      this.#hover = this.#grid[8 * y + x];
      this.#addClass(this.#hover.attributes, 'hover');
    }
  }
}
