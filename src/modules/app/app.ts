import { createApp, ref, type App as VueApp } from 'vue';

import AppView from './app-view.vue';
import { Board } from '@/modules/chess/board';

// ui componnents
import UiButton from '@/ui/button.vue';
import UiItem from '@/ui/item.vue';

// views
import BoardView from '@/modules/chess/board-view.vue';
import { Chess } from '@/modules/chess/chess';

export class App {
  readonly #vueApp: VueApp;
  readonly #title = ref('app');
  readonly chess = new Chess(
    {
      turn: 'white',
      figures: [
        { color: 'white', type: 'pawn', x: 2, y: 1 },
        { color: 'white', type: 'pawn', x: 6, y: 4 },
        { color: 'white', type: 'rook', x: 0, y: 0 },
        { color: 'white', type: 'queen', x: 3, y: 2 },
        { color: 'white', type: 'knight', x: 1, y: 0 },
        { color: 'white', type: 'bishop', x: 2, y: 0 },
        { color: 'white', type: 'bishop', x: 6, y: 1 },
        { color: 'white', type: 'king', x: 4, y: 0 },
        { color: 'white', type: 'rook', x: 7, y: 0 },
        { color: 'black', type: 'bishop', x: 0, y: 4 },
        { color: 'black', type: 'rook', x: 0, y: 7 },
        { color: 'black', type: 'king', x: 4, y: 7 },
        { color: 'black', type: 'pawn', x: 5, y: 6 },
      ],
    },
  );

  readonly board = new Board(this.chess);

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

  reset() {
    this.chess.reset();
  }
}
