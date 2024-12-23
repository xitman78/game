import { watch } from 'vue';
import { Vec } from '@/lib/bi';
import { it } from '@/lib/reactive';
import { Disposable } from '@/lib/std';
import { Transformable } from '@/lib/svg/transformable';
import type { Figure } from '@/modules/chess/figure';

export class Shape extends Transformable {
  readonly #disposer = new Disposable();
  readonly figure: Figure;

  constructor(figure: Figure) {
    super('g');

    this.figure = figure;
    const scale = 1 / 8; // all shape images have size 8x8
    this.scale = new Vec(scale, scale);
    const use = it('use');
    this.add(use);

    this.#disposer.add(
      watch(
        () => ({ x: figure.position.x, y: figure.position.y }),
        () => this.position = figure.position,
        { immediate: true },
      ),
      watch(
        () => ({ color: figure.color, type: figure.type }),
        () => {
          const cssColor = figure.color;
          const cssType = figure.type;
          const shapeId = figure.type;
          this.attributes.class = `${cssColor} ${cssType}`;
          this.attributes.filter = `url(#${cssColor}-shadow)`;
          use.attributes.href = `#${shapeId}`;
        },
        { immediate: true },
      ),
    );
  }

  dispose() {
    this.#disposer.dispose();
    super.dispose();
  }
}
