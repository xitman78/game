import { ref, type Ref } from 'vue';
import { Vec } from '@/lib/bi';
import type { Color, FigureData, Type } from '@/modules/chess/types';

export class Figure {
  #color: Ref<Color> = ref('white');
  #type: Ref<Type>;
  #position: Ref<Vec>;
  moved = false;
  passable = false;

  constructor(data: FigureData) {
    this.color = data.color;
    this.#type = ref(data.type);
    this.#position = ref(new Vec(data.x, data.y));
    this.moved = data.moved || false;
    this.passable = data.passable || false;
  }

  get color() {
    return this.#color.value;
  }

  set color(value) {
    this.#color.value = value;
  }

  get type() {
    return this.#type.value;
  }

  // pawn can change it's type
  set type(value) {
    this.#type.value = value;
  }

  get position() {
    return this.#position.value;
  }

  set position(value) {
    this.#position.value = value;
  }
}
