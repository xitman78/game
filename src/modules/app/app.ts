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

  reset() {
    this.#board.reset();
  }
}
