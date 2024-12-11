import { createApp, ref, type App as VueApp } from 'vue';

import AppView from './app-view.vue';
import { Board } from '@/modules/chess/board';

// ui componnents
import UiButton from '@/ui/button.vue';
import UiItem from '@/ui/item.vue';

// views
import BoardView from '@/modules/chess/board-view.vue';

export class App {
  readonly #vueApp: VueApp;
  readonly #title = ref('app');
  readonly #board = new Board();

  readonly #x0 = ref(0);
  readonly #y0 = ref(1);
  readonly #x1 = ref(4);
  readonly #y1 = ref(4);

  constructor() {
    this.#vueApp = createApp(AppView, { model: this });
    this.#vueApp
      // ui
      .component('ui-button', UiButton)
      .component('ui-item', UiItem)
      // views
      .component('board-view', BoardView)
      ;
  }

  run() {
    this.#vueApp.mount('#app');
  }

  get title() {
    return this.#title.value;
  }

  set title(value) {
    this.#title.value = value;
  }

  get board() {
    return this.#board;
  }

  get x0() { return this.#x0.value; }
  set x0(value) { this.#x0.value = value; }
  get y0() { return this.#y0.value; }
  set y0(value) { this.#y0.value = value; }
  get x1() { return this.#x1.value; }
  set x1(value) { this.#x1.value = value; }
  get y1() { return this.#y1.value; }
  set y1(value) { this.#y1.value = value; }

  move() {
    this.#board.move(this.x0, this.y0, this.x1, this.y1);
  }

  remove() {
    this.#board.remove(this.x1, this.y1);
  }

  reset() {
    this.#board.reset();
  }
}
