import { ref } from 'vue';
import { it } from '@/lib/reactive';
import { Shape } from '@/modules/chess/shape';
import { ExplicitPromise } from '@/lib/async';
import { Figure } from '@/modules/chess/figure';
import type { Color, Type } from '@/modules/chess/types';

export class FigureSelector {
  readonly #selectType: () => ExplicitPromise<Type>;
  #selector: ExplicitPromise<Type> | undefined;
  readonly #show = ref(false);

  readonly figures: Figure[] = (<Type[]>['rook', 'knight', 'bishop', 'queen'])
    .map(type => new Figure({ color: 'black', type, x: 0, y: 0 }));

  readonly shapes: Shape[] = this.figures.map(f => new Shape(f));

  readonly images = this.shapes.map(shape =>
    it('svg', { viewBox: '0 0 1 1' }, [
      it('g', { transform: 'translate(0 1) scale(1 -1)' }, [shape]),
    ]),
  );

  constructor(selectType: () => ExplicitPromise<Type>) {
    this.#selectType = selectType;
  }

  pick = async (color: Color) => {
    this.figures.forEach(f => f.color = color);
    this.#selector = this.#selectType();
    this.show = true;
    return await this.#selector;
  };

  select(type: Type) {
    this.show = false;
    this.#selector?.resolve(type);
  }

  get show() {
    return this.#show.value;
  }

  set show(value) {
    this.#show.value = value;
  }
}
