import { ref, type Ref } from 'vue';
import { Item, it } from '@/lib/reactive';
import { Transformable } from '@/lib/svg/transformable';
import { Vec } from '@/lib/bi';

export type Color = 'white' | 'black';

export interface Figure {
  x: number;
  y: number;
  readonly color: Color;
  readonly shape: Item;
}

export class Pawn implements Figure {
  readonly #x = ref(0);
  readonly #y = ref(0);
  readonly #color: Ref<Color> = ref('white');
  readonly #shape = new Transformable('g');

  constructor(color: Color, x: number, y: number) {
    this.#color.value = color;
    this.#shape.position = new Vec(x, y);
    this.#shape.scale = new Vec(0.125, 0.125);
    this.#shape.add(it('path', {
      d: `
        M 2,1 C 2,2 2,2 3,2 L 3.25,4 C 2.5,4 2.5,4 2.5,4.25 C 2.5,4.5 2.5,4.5 3.25,4.5
        C 3,6 3,6 4,6 C 5,6 5,6 4.75,4.5 C 5.5,4.5 5.5,4.5 5.5,4.25 C 5.5,4 5.5,4 4.75,4
        L 5,2 C 6,2 6,2 6,1 z
      `,
      'stroke-width': 0.2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      stroke: 'darkred',
      fill: this.color === 'white' ? 'white' : 'black',
    }));
  }

  get x() {
    return this.#shape.position.x;
  }
  set x(value) {
    this.#shape.position.x = value;
  }
  get y() {
    return this.#shape.position.y;
  }
  set y(value) {
    this.#shape.position.y = value;
  }
  get color() {
    return this.#color.value;
  }
  get shape() {
    return this.#shape;
  }
}
