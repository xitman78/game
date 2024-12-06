import { Transformable } from '@/lib/svg/transformable';
import { Vec } from '@/lib/bi';

export type Color = 'white' | 'black';
export type Type = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

function createShape(color: Color, type: Type) {
  const scale = 1/8; // all shape images have size 8x8
  const cssColor = color;
  const cssType = type;
  const shape = new Transformable('path', { class: `${cssColor} ${cssType}`});
  shape.scale = new Vec(scale, scale);
  return shape;
}

export class Figure {
  #color: Color;
  #type: Type;
  #position: Vec;
  #shape: Transformable;

  constructor(color: Color, type: Type, x: number, y: number) {
    const position = new Vec(x, y);
    this.#color = color;
    this.#type = type;
    this.#position = position;
    this.#shape = createShape(color, type);
    this.#shape.position = position;
  }

  get color() {
    return this.#color;
  }
  get type() {
    return this.#type;
  }
  // pawn can change it's type
  set type(value) {
    this.#type = value;
  }
  get position() {
    return this.#position;
  }
  set position(value) {
    this.#position = value;
    this.#shape.position = value;
  }
  get shape() {
    return this.#shape;
  }
}
