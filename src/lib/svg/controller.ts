import { shallowRef, watchEffect } from 'vue';

import * as re from '@/lib/reactive';
import * as std from '@/lib/std';
import * as bi from '@/lib/bi';

import { Animation } from '@/lib/animation';
import { Camera } from '@/lib/svg/camera';
import { time } from '@/lib/std';

export type ViewBox = { left: number; top: number; width: number; height: number };

export const enum Gesture {
  NONE,
  DRAG,
  ROTATE,
}

export type Config = {
  pan: boolean;
  zoom: boolean;
  rotate: boolean;
  minZoom: number;
  maxZoom: number;
  width: number;
  height: number;
};

const defaultConfig: Config = {
  pan: true,
  zoom: true,
  rotate: true,
  minZoom: 0.5,
  maxZoom: 2,
  width: 2,
  height: 2,
};

export class Controller implements std.IDisposable {
  #config: Config;
  #mounted = new std.Disposable();
  #disposer = new std.Disposable();

  #root: re.Item;
  #scene: re.Item;
  #camera: Camera;
  #defaultCamera: Camera;
  #resizer = new ResizeObserver(() => this.#resize());

  // host element and it's size
  #element?: HTMLElement;
  #clientWidth = 0;
  #clientHeight = 0;

  // viewBox will be changed to fit #config.width and #config.height into client size
  #viewBox = shallowRef<ViewBox>({ left: -1, top: -1, width: 2, height: 2 });

  #gesture = Gesture.NONE;
  #pickedPoint = new bi.Vec();
  #pickedAngle = 0;
  #pickedPosition = new bi.Vec();
  #pickedRotation = 0;
  #pickedTransform = new bi.Mat(1, 0, 0, 1, 0, 0);

  #zoomAnimation = new Animation();
  #zoomStart = 0;
  #zoomDuration = 0.25;
  #zoomFrom = 0;
  #zoomTo = 0;
  #zoomPosition = new bi.Vec();

  #resetAnimation = new Animation();
  #resetStart = 0;
  #resetDuration = 0.5;
  #resetFrom = bi.Mat.scale(1, 1);
  #resetTo: bi.Mat;

  constructor(root: re.Item, scene: re.Item, camera: Camera, options?: Partial<Config>) {
    this.#config = Object.assign({ ...defaultConfig }, options);
    this.#root = root;
    this.#scene = scene;
    this.#camera = camera;
    this.#defaultCamera = camera.clone();
    this.#resetTo = camera.inverse;
    this.#disposer.add(
      () => this.#resizer.disconnect(),
      () => this.#mounted.dispose(),
    );
  }

  dispose() {
    this.#disposer.dispose();
  }

  mount(element: HTMLElement) {
    this.#element = element;
    this.#resizer.observe(element);
    this.#mounted.add(
      () => {
        this.#resizer.unobserve(this.#element!);
        this.#element = undefined;
        this.#zoomAnimation.stop();
        this.#resetAnimation.stop();
      },
      std.onElementEvent(element, 'dblclick', () => this.reset()),
      std.onElementEvent(element, 'pointerdown', this.#pick),
      std.onElementEvent(element, 'pointermove', this.#drag),
      std.onElementEvent(element, 'contextmenu', this.#contextMenu),
      std.onElementEvent(element, 'pointerup', this.#drop),
      std.onElementEvent(element, 'wheel', this.#wheel, { passive: false }),
      watchEffect(() => (this.#scene.attributes.transform = this.#camera.inverse.toCss())),
    );
  }

  unmount() {
    this.#mounted.dispose();
  }

  get viewBox() {
    return this.#viewBox.value;
  }

  reset() {
    if (this.#resetAnimation.isActive()) return;

    this.#resetStart = time();
    this.#resetFrom = this.#camera.inverse;

    this.#zoomAnimation.stop();
    this.#resetAnimation.start(this.#resetFrame);
  }

  resize(width: number, height: number) {
    this.#config.width = width;
    this.#config.height = height;
    if (this.#element) this.#resize();
  }

  toCamera(e: MouseEvent) {
    const { x, y } = std.elementOffset(this.#element!, e);
    const viewBox = this.#viewBox.value;
    return new bi.Vec(
      viewBox.left + (viewBox.width * x) / this.#clientWidth,
      viewBox.top + (viewBox.height * y) / this.#clientHeight,
    );
  }

  #resize() {
    if (!this.#element) return;

    const width = this.#element.clientWidth;
    const height = this.#element.clientHeight;

    this.#clientWidth = width;
    this.#clientHeight = height;
    if (width === 0 || height === 0) {
      return;
    }

    const widthScale = width / this.#config.width;
    const heightScale = height / this.#config.height;
    let w, h;
    if (widthScale < heightScale) {
      w = this.#config.width;
      h = (this.#config.height * heightScale) / widthScale;
    }
    else {
      w = (this.#config.width * widthScale) / heightScale;
      h = this.#config.height;
    }

    this.#viewBox.value = { left: -w / 2, top: -h / 2, width: w, height: h };
    this.#root.attributes.viewBox = `${-w / 2} ${-h / 2} ${w} ${h}`;
  }

  #resetFrame = () => {
    let t = std.smoothStep(0, 1, (time() - this.#resetStart) / this.#resetDuration);
    if (t >= 1) {
      this.#resetAnimation.stop();
      t = 1;
    }

    const d = bi.Mat.inverse(bi.interpolate(this.#resetFrom, this.#resetTo, t)).decompose();
    this.#camera.position = d.translation;
    this.#camera.rotation = d.rotation;
    this.#camera.scale = d.scale;
  };

  #setZoom(zoom: number) {
    const scale = this.#defaultCamera.scale;
    const newScale = new bi.Vec(scale.x * zoom, scale.y * zoom);
    const newCamera = new Camera({
      position: this.#camera.position,
      rotation: this.#camera.rotation,
      scale: newScale,
    });

    const oldPos = this.#camera.transform.transform(this.#zoomPosition);
    const newPos = newCamera.transform.transform(this.#zoomPosition);

    this.#camera.position = new bi.Vec(
      this.#camera.position.x + oldPos.x - newPos.x,
      this.#camera.position.y + oldPos.y - newPos.y,
    );
    this.#camera.scale = newScale;
  }

  readonly #zoomFrame = () => {
    let t = (std.time() - this.#zoomStart) / this.#zoomDuration;
    if (t >= 1) {
      this.#zoomAnimation.stop();
      t = 1;
    }
    const zoom = std.mix(this.#zoomFrom, this.#zoomTo, t);
    this.#setZoom(zoom);
  };

  readonly #pick = (e: PointerEvent) => {
    switch (e.button) {
      case std.Mouse.LEFT:
        if (!this.#config.pan) return;
        this.#gesture = Gesture.DRAG;
        break;
      case std.Mouse.RIGHT:
        if (!this.#config.rotate) return;
        this.#gesture = Gesture.ROTATE;
        break;
      default:
        return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.#pickedPosition = this.#camera.position;
    this.#pickedRotation = this.#camera.rotation;
    this.#pickedTransform = this.#camera.transform;
    this.#pickedPoint = this.#pickedTransform.transform(this.toCamera(e));
    this.#pickedAngle = Math.atan2(
      this.#pickedPoint.y - this.#pickedPosition.y,
      this.#pickedPoint.x - this.#pickedPosition.x);
  };

  readonly #drag = (e: PointerEvent) => {
    if (this.#gesture === Gesture.DRAG) {
      const point = this.#pickedTransform.transform(this.toCamera(e));
      const delta = new bi.Vec(point.x - this.#pickedPoint.x, point.y - this.#pickedPoint.y);
      this.#camera.position = new bi.Vec(
        this.#pickedPosition.x - delta.x,
        this.#pickedPosition.y - delta.y,
      );
    }
    else if (this.#gesture === Gesture.ROTATE) {
      const point = this.#pickedTransform.transform(this.toCamera(e));
      const delta = new bi.Vec(point.x - this.#pickedPosition.x, point.y - this.#pickedPosition.y);
      const a = Math.atan2(delta.y, delta.x);
      this.#camera.rotation = std.mod(this.#pickedRotation + this.#pickedAngle - a, 2 * Math.PI);
    }
  };

  readonly #drop = (e: PointerEvent) => {
    if (this.#gesture === Gesture.NONE) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    this.#gesture = Gesture.NONE;
  };

  readonly #contextMenu = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };

  readonly #wheel = (e: WheelEvent) => {
    if (!this.#config.zoom) return;

    e.preventDefault();

    const k = e.deltaY < 0 ? 0.8 : 1.25;

    this.#zoomFrom = this.#camera.scale.x / this.#defaultCamera.scale.x;
    this.#zoomTo = std.clamp(k * this.#zoomFrom, this.#config.minZoom, this.#config.maxZoom);
    this.#zoomStart = std.time();
    this.#zoomPosition = this.toCamera(e);
    this.#resetAnimation.stop();
    this.#zoomAnimation.start(this.#zoomFrame);
  };
}
