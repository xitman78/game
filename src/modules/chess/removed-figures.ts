import { shallowReactive, watch } from 'vue';
import { it } from '@/lib/reactive';
import type { Figure } from '@/modules/chess/figure';
import { Shape } from '@/modules/chess/shape';
import { Disposable } from '@/lib/std';
import { Vec } from '@/lib/bi';

export class RemovedFigures {
  readonly #disposer = new Disposable();

  // readonly g = it('g', { transform: 'translate(0 4) scale(0.5 -0.5)' });
  // readonly root = it('svg', { viewBox: '0 0 1 4' }, [this.g]);
  readonly root = it('g');
  // readonly root = this.g;

  #figures: () => Figure[];
  #shapes = shallowReactive<Shape[]>([]);

  constructor(figures: () => Figure[]) {
    this.#figures = figures;
    watch(
      () => this.#figures(),
      (figures) => {
        const shapes = figures.map(f => new Shape(f));
        for (const [index, shape] of shapes.entries()) {
          // const x = index & 1;
          // const y = 7 - Math.floor(index / 2);
          // shape.position = new Vec(x, y);
          shape.position = new Vec(index, 0);
        }
        this.#shapes.splice(0, Infinity, ...shapes);
        this.root.clear();
        this.root.add(...this.#shapes);
      },
      { immediate: true },
    );
  }

  get figures() {
    return this.#figures();
  }
}
