import { onAnimationFrame, time } from '@/lib/std';

export class Animation {
  #doNothing = () => {};
  #stopAnimation = this.#doNothing;

  #emptyCallback = (dt: number) => {};
  #frameCallback = this.#emptyCallback;

  #start = 0;

  isActive() {
    return this.#frameCallback !== this.#emptyCallback;
  }

  start(callback: (dt: number) => void) {
    this.#start = time();
    this.stop();
    this.#frameCallback = callback;
    this.#stopAnimation = onAnimationFrame(this.#frame);
  }

  stop() {
    this.#stopAnimation();
    this.#stopAnimation = this.#doNothing;
    this.#frameCallback = this.#emptyCallback;
  }

  #frame = () => {
    const now = time();
    const dt = now - this.#start;
    this.#start = now;
    this.#frameCallback(dt);
  };
}
