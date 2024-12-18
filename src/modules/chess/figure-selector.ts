import { ref, type Ref } from 'vue';
import { it, Item } from '@/lib/reactive';
import { Shape } from '@/modules/chess/board';
import { Figure, type Color, type Type } from '@/modules/chess/chess';
import { ExplicitPromise } from '@/lib/async';

export class FigureSelector {
  readonly #color: Ref<Color> = ref('black');

  readonly images: Item[] = [
    it('svg', { viewBox: '0 0 1 1' }),
    it('svg', { viewBox: '0 0 1 1' }),
    it('svg', { viewBox: '0 0 1 1' }),
    it('svg', { viewBox: '0 0 1 1' }),
  ];

  readonly figures: Figure[] = (<Type[]>['rook', 'knight', 'bishop', 'queen'])
    .map(type => new Figure({ color: 'black', type, x: 0, y: 0 }));

  readonly shapes: Shape[] = this.figures.map(f => new Shape(f));

  constructor() {
    this.images.forEach((image, index) => {
      const g = it('g', { transform: 'translate(0 1) scale(1 -1)' });
      g.add(this.shapes[index]);
      image.add(g);
    });
  }

  get color() {
    return this.#color.value;
  }

  set color(value) {
    this.#color.value = value;
    this.figures.forEach(f => f.color = value);
  }

  interaction: (() => ExplicitPromise<Type>) = () => new ExplicitPromise<Type>(() => {});
  promise: ExplicitPromise<Type> | undefined;

  async pick(color: Color) {
    this.color = color;
    this.promise = this.interaction();
    return await this.promise;
  }

  select(type: Type) {
    this.promise?.resolve(type);
  }

  resolve(type: Type) {
    this.promise?.resolve(type);
  }
}
