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

  readonly shapes: Shape[] = this.figures.map(f => new Shape(f));

  readonly images = this.shapes.map(shape =>
    it('svg', { viewBox: '0 0 1 1' }, [
      it('g', { transform: 'translate(0 1) scale(1 -1)' }, []),
    ]),
  );

  readonly root = it('g', this.shapes);

  constructor(pickType: () => ExplicitPromise<Type>) {
    this.#pickType = pickType;
    this.shapes.forEach(shape => shape.on('click', () => {
      this.show = false;
      this.#promise?.resolve(shape.figure.type);
    }));
  }

  #click = (shape: Shape) => () => {};

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
