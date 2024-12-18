import { ref, watch } from 'vue';

import { Buttons, Disposable, onElementEvent, promiseWithResolvers } from '@/lib/std';

type Handler = {
  element?: HTMLElement;
  pick: (e: PointerEvent) => void;
  drag: (e: PointerEvent) => void;
  drop: (e: PointerEvent) => void;
};

export const enum State {
  CLOSED,
  NON_MODAL,
  MODAL,
  CLOSING_TRANSITION,
}

export type Options = {
  draggable?: boolean;
  resizable?: boolean;
};

async function transitionEnd(target: HTMLElement, propertyName: string) {
  const { promise, resolve } = promiseWithResolvers<void>();

  const eventHandler = (e: TransitionEvent) => {
    if (e.target === target && e.propertyName === propertyName) {
      target.removeEventListener('transitionend', eventHandler);
      resolve();
    }
  };

  target.addEventListener('transitionend', eventHandler);

  return promise;
}

export class Dialog {
  readonly #state = ref(State.CLOSED);
  readonly #options: Options;
  readonly #mounted = new Disposable();
  readonly #l = ref(0);
  readonly #t = ref(0);
  readonly #w = ref(500);
  readonly #h = ref(800);
  readonly #mw = ref(480);
  readonly #mh = ref(480);
  readonly #captured = { x: 0, y: 0 };

  #root?: HTMLDialogElement;

  constructor(options?: Options) {
    this.#options = Object.assign({ draggable: false, resizable: false }, options);
    this.#options.draggable ||= this.#options.resizable;
  }

  get draggable() {
    return this.#options.draggable;
  }

  get resizable() {
    return this.#options.resizable;
  }

  get state() {
    return this.#state.value;
  }

  close() {
    if (!this.#continueClose()) {
      return;
    }
    this.#root!.close();
    this.#state.value = State.CLOSED;
  }

  async closeAsync(transitionPropertyName: string) {
    if (!this.#continueClose()) {
      return;
    }
    this.#state.value = State.CLOSING_TRANSITION;
    await transitionEnd(this.#root!, transitionPropertyName);
    this.#root!.close();
    this.#state.value = State.CLOSED;
  }

  show() {
    if (!this.#root) {
      this.#state.value = State.NON_MODAL;
      return;
    }
    if (this.#state.value !== State.CLOSED) {
      return;
    }
    this.#root.show();
    this.#state.value = State.NON_MODAL;
  }

  showModal() {
    if (!this.#root) {
      this.#state.value = State.MODAL;
      return;
    }
    if (this.#state.value !== State.CLOSED) {
      return;
    }
    this.#root.showModal();
    this.#state.value = State.MODAL;
  }

  // -----------------------------------------------------------
  get left() {
    return this.#l.value;
  }

  set left(value) {
    this.#l.value = value;
  }

  get top() {
    return this.#t.value;
  }

  set top(value) {
    this.#t.value = value;
  }

  get width() {
    return this.#w.value;
  }

  set width(value) {
    this.#w.value = value;
  }

  get height() {
    return this.#h.value;
  }

  set height(value) {
    this.#h.value = value;
  }

  get minWidth() {
    return this.#mw.value;
  }

  set minWidth(value) {
    this.#mw.value = value;
  }

  get minHeight() {
    return this.#mh.value;
  }

  set minHeight(value) {
    this.#mh.value = value;
  }

  // -----------------------------------------------------------
  mount(root: HTMLDialogElement) {
    this.#root = root;
    this.#mounted.add(onElementEvent(root, 'keydown', this.#keyDown));

    const grid = (root.firstChild as HTMLElement).children as unknown as HTMLElement[];

    if (this.#options.draggable) {
      this.#cc.element = grid[4];
      this.#mounted.add(
        onElementEvent(this.#cc.element, 'dblclick', this.#dblClick),
        onElementEvent(this.#cc.element, 'pointerdown', this.#cc.pick),
      );
    }

    if (this.#options.resizable) {
      this.#nw.element = grid[0];
      this.#nn.element = grid[1];
      this.#ne.element = grid[2];
      this.#ww.element = grid[3];
      this.#ee.element = grid[5];
      this.#sw.element = grid[6];
      this.#ss.element = grid[7];
      this.#se.element = grid[8];

      [this.#nw, this.#nn, this.#ne, this.#ww, this.#ee, this.#sw, this.#ss, this.#se].forEach(
        item => this.#mounted.add(onElementEvent(item.element!, 'pointerdown', item.pick)),
      );
    }

    this.#mounted.add(
      watch(
        () => this.state,
        () => [State.NON_MODAL, State.MODAL].includes(this.state) && this.fit(),
        { immediate: true },
      ),
      () => {
        this.#root = undefined;
        if (this.state === State.CLOSING_TRANSITION) {
          this.#state.value = State.CLOSED;
        }
      },
    );

    this.center();

    switch (this.state) {
      case State.NON_MODAL:
        root.show();
        break;
      case State.MODAL:
        root.showModal();
        break;
    }
  }

  unmount() {
    this.#mounted.dispose();
  }

  center() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.left = Math.floor(0.5 * (width - this.width));
    this.top = Math.floor(0.5 * (height - this.height));
  }

  fit() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.width > w) this.width = w;
    if (this.height > h) this.height = h;
    if (this.left < 0) this.left = 0;
    if (this.top < 0) this.top = 0;
    if (this.left + this.width > w) this.left = (w - this.width) / 2;
    if (this.top + this.height > h) this.top = (h - this.height) / 2;
  }

  // -----------------------------------------------------------
  #continueClose() {
    if (!this.#root) {
      this.#state.value = State.CLOSED;
      return false;
    }
    return ![State.CLOSED, State.CLOSING_TRANSITION].includes(this.state);
  }

  #capture(h: Handler, e: PointerEvent) {
    h.element!.addEventListener('pointermove', h.drag);
    h.element!.addEventListener('pointerup', h.drop);
    h.element!.setPointerCapture(e.pointerId);
  }

  #release(h: Handler, e: PointerEvent) {
    h.element!.removeEventListener('pointermove', h.drag);
    h.element!.removeEventListener('pointerup', h.drop);
    h.element!.releasePointerCapture(e.pointerId);
  }

  #dblClick = (e: Event) => {
    if (e.target === this.#cc.element) {
      this.center();
    }
  };

  #keyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      this.closeAsync('transform');
    }
  };

  // -----------------------------------------------------------
  #ccPick = (e: PointerEvent) => {
    if (e.target === this.#cc.element && e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.left;
      this.#captured.y = e.screenY - this.top;
      this.#capture(this.#cc, e);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  #ccDrag = (e: PointerEvent) => {
    this.left = e.screenX - this.#captured.x;
    this.top = e.screenY - this.#captured.y;
  };

  #ccDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#cc, e);
    }
  };

  // -----------------------------------------------------------
  #nwPick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.left;
      this.#captured.y = e.screenY - this.top;
      this.#capture(this.#nw, e);
    }
  };

  #nwDrag = (e: PointerEvent) => {
    const left = e.screenX - this.#captured.x;
    const top = e.screenY - this.#captured.y;
    const width = Math.max(this.minWidth, this.left + this.width - left);
    const height = Math.max(this.minHeight, this.top + this.height - top);

    this.left = this.left + this.width - width;
    this.top = this.top + this.height - height;
    this.width = width;
    this.height = height;
  };

  #nwDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#nw, e);
    }
  };

  // -----------------------------------------------------------
  #nnPick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.y = e.screenY - this.top;
      this.#capture(this.#nn, e);
    }
  };

  #nnDrag = (e: PointerEvent) => {
    const top = e.screenY - this.#captured.y;
    const height = Math.max(this.minHeight, this.top + this.height - top);

    this.top = this.top + this.height - height;
    this.height = height;
  };

  #nnDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#nn, e);
    }
  };

  // -----------------------------------------------------------
  #nePick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.width;
      this.#captured.y = e.screenY - this.top;
      this.#capture(this.#ne, e);
    }
  };

  #neDrag = (e: PointerEvent) => {
    const top = e.screenY - this.#captured.y;
    const height = Math.max(this.minHeight, this.top + this.height - top);

    this.width = Math.max(this.minWidth, e.screenX - this.#captured.x);
    this.top = this.top + this.height - height;
    this.height = height;
  };

  #neDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#ne, e);
    }
  };

  // -----------------------------------------------------------
  #wwPick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.left;
      this.#capture(this.#ww, e);
    }
  };

  #wwDrag = (e: PointerEvent) => {
    const left = e.screenX - this.#captured.x;
    const width = Math.max(this.minWidth, this.left + this.width - left);

    this.left = this.left + this.width - width;
    this.width = width;
  };

  #wwDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#ww, e);
    }
  };

  // -----------------------------------------------------------
  #eePick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.width;
      this.#capture(this.#ee, e);
    }
  };

  #eeDrag = (e: PointerEvent) => {
    this.width = Math.max(this.minWidth, e.screenX - this.#captured.x);
  };

  #eeDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#ee, e);
    }
  };

  // -----------------------------------------------------------
  #swPick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.left;
      this.#captured.y = e.screenY - this.height;
      this.#capture(this.#sw, e);
    }
  };

  #swDrag = (e: PointerEvent) => {
    const left = e.screenX - this.#captured.x;
    const width = Math.max(this.minWidth, this.left + this.width - left);

    this.left = this.left + this.width - width;
    this.width = width;
    this.height = Math.max(this.minHeight, e.screenY - this.#captured.y);
  };

  #swDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#sw, e);
    }
  };

  // -----------------------------------------------------------
  #ssPick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.y = e.screenY - this.height;
      this.#capture(this.#ss, e);
    }
  };

  #ssDrag = (e: PointerEvent) => {
    this.height = Math.max(this.minHeight, e.screenY - this.#captured.y);
  };

  #ssDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#ss, e);
    }
  };

  // -----------------------------------------------------------
  #sePick = (e: PointerEvent) => {
    if (e.buttons & Buttons.LEFT) {
      this.#captured.x = e.screenX - this.width;
      this.#captured.y = e.screenY - this.height;
      this.#capture(this.#se, e);
    }
  };

  #seDrag = (e: PointerEvent) => {
    this.width = Math.max(this.minWidth, e.screenX - this.#captured.x);
    this.height = Math.max(this.minHeight, e.screenY - this.#captured.y);
  };

  #seDrop = (e: PointerEvent) => {
    if (!(e.buttons & Buttons.LEFT)) {
      this.#release(this.#se, e);
    }
  };

  // -----------------------------------------------------------
  readonly #cc: Handler = {
    pick: this.#ccPick,
    drag: this.#ccDrag,
    drop: this.#ccDrop,
  };

  readonly #nw: Handler = {
    pick: this.#nwPick,
    drag: this.#nwDrag,
    drop: this.#nwDrop,
  };

  readonly #nn: Handler = {
    pick: this.#nnPick,
    drag: this.#nnDrag,
    drop: this.#nnDrop,
  };

  readonly #ne: Handler = {
    pick: this.#nePick,
    drag: this.#neDrag,
    drop: this.#neDrop,
  };

  readonly #ww: Handler = {
    pick: this.#wwPick,
    drag: this.#wwDrag,
    drop: this.#wwDrop,
  };

  readonly #ee: Handler = {
    pick: this.#eePick,
    drag: this.#eeDrag,
    drop: this.#eeDrop,
  };

  readonly #sw: Handler = {
    pick: this.#swPick,
    drag: this.#swDrag,
    drop: this.#swDrop,
  };

  readonly #ss: Handler = {
    pick: this.#ssPick,
    drag: this.#ssDrag,
    drop: this.#ssDrop,
  };

  readonly #se: Handler = {
    pick: this.#sePick,
    drag: this.#seDrag,
    drop: this.#seDrop,
  };
}
