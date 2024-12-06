import { ref, watchEffect } from 'vue';

import * as re from '@/lib/reactive';
import * as std from '@/lib/std';
import * as bi from '@/lib/bi';

const rotation = bi.Mat.rotation;
const scale = bi.Mat.scale;
const translation = bi.Mat.translation;

export class Transformable extends re.Item implements std.IDisposable {
  readonly #disposer = new std.Disposable();
  readonly #position = ref(new bi.Vec());
  readonly #rotation = ref(0);
  readonly #scale = ref(new bi.Vec(1, 1));

  constructor(tag: string, data?: re.Attributes) {
    super(tag, data);
    this.#disposer.add(watchEffect(() => (this.attributes.transform = this.transform.toCss())));
  }

  dispose() {
    this.#disposer.dispose();
  }

  get position() {
    return this.#position.value;
  }

  set position(value) {
    this.#position.value = value.clone();
  }

  get scale() {
    return this.#scale.value;
  }

  set scale(value) {
    this.#scale.value = value.clone();
  }

  get rotation() {
    return this.#rotation.value;
  }

  set rotation(value) {
    this.#rotation.value = std.mod(value, 2 * Math.PI);
  }

  get transform() {
    return translation(this.position.x, this.position.y)
      .multiply(rotation(this.rotation))
      .multiply(scale(this.scale.x, this.scale.y));
  }

  set transform(value) {
    const { translation, rotation, scale } = value.decompose();
    this.position = translation;
    this.rotation = rotation;
    this.scale = scale;
  }
}
