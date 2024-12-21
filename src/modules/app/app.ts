import { createApp, type App as VueApp } from 'vue';

// ui componnents
import UiButton from '@/ui/button.vue';
import UiDialog from '@/ui/dialog.vue';
import UiIcon from '@/ui/icon.vue';
import UiItem from '@/ui/item.vue';

// views
import BoardView from '@/modules/chess/board-view.vue';
import FigureSelectorView from '@/modules/chess/figure-selector.vue';
import AppView from './app-view.vue';

import { Board } from '@/modules/chess/board';
import { Chess } from '@/modules/chess/chess';
import { Dialog } from '@/ui/lib/dialog';
import { ExplicitPromise } from '@/lib/async';
import type { Type } from '@/modules/chess/types';
import { FigureSelector } from '@/modules/chess/figure-selector';

export class App {
  readonly #vueApp: VueApp;
  readonly dialog = new Dialog({ draggable: false, resizable: false });

  readonly chess = new Chess(
    {
      turn: 'white',
      figures: [
        { color: 'white', type: 'pawn', x: 2, y: 2 },
        { color: 'white', type: 'pawn', x: 6, y: 4 },
        { color: 'white', type: 'pawn', x: 7, y: 6 },
        { color: 'white', type: 'rook', x: 0, y: 0 },
        { color: 'white', type: 'queen', x: 3, y: 5 },
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
  readonly figureSelector = new FigureSelector(
    () => new ExplicitPromise<Type>(
      () => { this.dialog.showModal(); },
      async (resolve, type) => {
        await this.dialog.closeAsync('transform');
        resolve(type);
      },
    ),
  );

  constructor() {
    this.#vueApp = createApp(AppView, { model: this });
    this.#vueApp
      // ui
      .component('ui-button', UiButton)
      .component('ui-dialog', UiDialog)
      .component('ui-icon', UiIcon)
      .component('ui-item', UiItem)
      // views
      .component('board-view', BoardView)
      .component('figure-selector', FigureSelectorView)
    ;

    this.chess.pick = this.figureSelector.pick;
  }

  run() {
    this.#vueApp.mount('#app');
  }

  reset() {
    this.chess.reset();
  }
}
