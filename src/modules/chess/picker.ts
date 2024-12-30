import { ref } from 'vue';
import { it } from '@/lib/reactive';
import { Shape } from '@/modules/chess/shape';
import { ExplicitPromise } from '@/lib/async';
import { Figure } from '@/modules/chess/figure';
import type { Color, Type } from '@/modules/chess/types';

export class Picker {
  readonly #pickType: () => ExplicitPromise<Type>;
  #promise: ExplicitPromise<Type> | undefined;
  readonly #show = ref(false);
  readonly #color = ref(<Color>'black');

  readonly figures: Figure[] = (<Type[]>['rook', 'knight', 'bishop', 'queen'])
    .map((type, index) => new Figure({ color: 'black', type, x: index, y: 0 }));

  readonly #bg = it('rect', { class: 'board-bg thin-border', x: 0, y: 0, width: 4, height: 1 });
  readonly #shapes: Shape[] = this.figures.map(f => new Shape(f));

  readonly root = it('g', [this.#bg], this.#shapes);

  constructor(pickType: () => ExplicitPromise<Type>) {
    this.#pickType = pickType;
    this.#shapes.forEach(shape => shape.on('click', () => {
      this.show = false;
      this.#promise?.resolve(shape.figure.type);
    }));
  }

  pick = async (color: Color) => {
    this.#color.value = color;
    this.figures.forEach(f => f.color = color);
    this.show = true;
    this.#promise = this.#pickType();
    return this.#promise;
  };

  select(type: Type) {
    this.show = false;
    this.#promise?.resolve(type);
  }

  get color() {
    return this.#color.value;
  }

  get show() {
    return this.#show.value;
  }

  set show(value) {
    this.#show.value = value;
  }
}
