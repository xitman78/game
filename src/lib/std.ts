export function assert(assertion: any, message?: any) {
  if (!assertion) {
    console.log(message);
    debugger;
  }
}

export function time() {
  return 0.001 * Date.now();
}

export function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function mix(a: number, b: number, x: number) {
  return a + (b - a) * x;
}

export function mod(a: number, b: number) {
  let x = a % b;
  if (x < 0) {
    x += b;
  }
  return x;
}

export function step(a: number, x: number) {
  return x < a ? 0 : 1;
}

export function smoothStep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherStep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * t * (t * (6 * t - 15) + 10);
}

export function cubicBezier(p: number[][], t: number) {
  t = clamp(t, 0, 1);
  const segments = Math.floor(p.length - 1) / 3;
  const interval = 1 / segments;
  let n = Math.floor(t / interval);
  if (n === segments) --n;
  const dt = t - interval * n;
  t = dt / interval;

  const a = (1 - t) ** 3;
  const b = 3 * (1 - t) ** 2 * t;
  const c = 3 * (1 - t) * t ** 2;
  const d = t ** 3;

  const i = n * 3;
  const x = a * p[i + 0][0] + b * p[i + 1][0] + c * p[i + 2][0] + d * p[i + 3][0];
  const y = a * p[i + 0][1] + b * p[i + 1][1] + c * p[i + 2][1] + d * p[i + 3][1];

  return [x, y];
}

export interface Point {
  x: number;
  y: number;
}

export const enum Mouse {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  BACK = 3,
  FORWARD = 4,
}

export const enum Buttons {
  LEFT = 1,
  RIGHT = 2,
  MIDDLE = 4,
  BACK = 8,
  FORWARD = 16,
}

/**
 * HTMLElement.addEventListener wrapper.
 * @param type event type.
 * @param handler event handler.
 * @param options event options.
 * @returns function that will remove handler when called.
 */
export function onElementEvent<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  element.addEventListener(type, handler, options);
  return () => element.removeEventListener(type, handler, options);
}

/**
 * Window.addEventListener wrapper.
 * @param type event type.
 * @param handler event handler.
 * @param options event options.
 * @returns function that will remove handler when called.
 */
export function onWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  window.addEventListener(type, handler, options);
  return () => window.removeEventListener(type, handler, options);
}

/**
 * Returns coordinates of MouseEvent (clientX, clientY) relative to given element.
 * @param element element.
 * @param e event.
 * @returns coordinates as { x, y }.
 */
export function elementOffset(element: Element, e: MouseEvent): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

/**
 * Calls given callback every animation frame.
 * @param callback callback to call.
 * @param immediate if true then additionally immediately calls callback.
 * @returns function that should be called to stop per-frame calls.
 */
export function onAnimationFrame(callback: FrameRequestCallback, immediate = false) {
  let handle = 0;
  const frameHandler = (time: DOMHighResTimeStamp) => {
    handle = window.requestAnimationFrame(frameHandler);
    callback(time);
  };
  if (immediate) {
    callback(performance.now());
  }
  handle = window.requestAnimationFrame(frameHandler);
  return () => window.cancelAnimationFrame(handle);
}

export interface IDisposable {
  dispose(): void;
}

export type Disposer = () => void;

export class Disposable implements IDisposable {
  readonly #disposers: Disposer[] = [];

  dispose() {
    this.#disposers.forEach(disposer => disposer());
    this.#disposers.length = 0;
  }

  add(...disposers: Disposer[]) {
    this.#disposers.push(...disposers);
  }
}

export function promiseWithResolvers<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: any) => void;
  const promise = new Promise<T>((resolveFunc, rejectFunc) => {
    resolve = resolveFunc;
    reject = rejectFunc;
  });

  return { promise, resolve, reject };
}
