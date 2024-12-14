import { ref, type Ref } from 'vue';
import { Transformable } from '@/lib/svg/transformable';
import { Vec } from '@/lib/bi';
import { it, Item } from '@/lib/reactive';

export type Color = 'white' | 'black';
export type Type = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type Move = 'normal' | 'capture' | 'en-passant' | 'king-castle' | 'queen-castle';

export type FigureData = {
  color: Color;
  type: Type;
  x: number;
  y: number;
};

export type MoveData = {
  move: Move;
  color: Color;
  type: Type;
  from?: Vec;
  to?: Vec;
  capture?: Vec;
  promotion: Type;
};

function createShape(color: Color, type: Type) {
  const scale = 1 / 8; // all shape images have size 8x8
  const cssColor = color;
  const cssType = type;
  const svgId = type;
  const shape = new Transformable('g', { class: `${cssColor} ${cssType}` });
  shape.scale = new Vec(scale, scale);
  const use = it('use', { href: `#${svgId}` });
  shape.add(use);
  return shape;
}

export class Figure {
  #color: Color;
  #type: Ref<Type>;
  #position: Ref<Vec>;
  #moves: Vec[] = [];
  #shape: Transformable;
  #use: Item;

  constructor(color: Color, type: Type, x: number, y: number) {
    const position = new Vec(x, y);
    this.#color = color;
    this.#type = ref(type);
    this.#position = ref(position);
    this.#shape = createShape(color, type);
    this.#shape.position = position;
    this.#use = this.#shape.items[0];
  }

  get color() {
    return this.#color;
  }

  get type() {
    return this.#type.value;
  }

  // pawn can change it's type
  set type(value) {
    this.#type.value = value;
    const cssColor = this.color;
    const cssType = value;
    this.#shape.attributes.class = `${cssColor} ${cssType}`;
  }

  get position() {
    return this.#position.value;
  }

  set position(value) {
    this.#position.value = value;
    this.#shape.position = value;
  }

  get shape() {
    return this.#shape;
  }

  move(p: Vec) {
    this.position = p;
    this.#moves.push(p);
  }
}
