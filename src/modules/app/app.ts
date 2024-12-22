import { createApp, type App as VueApp } from 'vue';

// ui componnents
import UiButton from '@/ui/button.vue';
import UiDialog from '@/ui/dialog.vue';
import UiIcon from '@/ui/icon.vue';
import UiItem from '@/ui/item.vue';

// views
import BoardView from '@/modules/chess/board-view.vue';
import PickerView from '@/modules/chess/picker-view.vue';
import RemovedFiguresView from '@/modules/chess/removed-figures-view.vue';
import AppView from './app-view.vue';

import { Board } from '@/modules/chess/board';
import { Chess } from '@/modules/chess/chess';
import { Dialog } from '@/ui/lib/dialog';
import { ExplicitPromise } from '@/lib/async';
import type { Color, Type } from '@/modules/chess/types';
import { Picker } from '@/modules/chess/picker';
import { RemovedFigures } from '@/modules/chess/removed-figures';

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
        { color: 'black', type: 'pawn', x: 0, y: 1 },
      ],
    },
  );

  readonly board = new Board(this.chess);
  readonly picker = new Picker(() => new ExplicitPromise<Type>(() => {}));
  readonly removedWhite = new RemovedFigures(() => this.chess.removedWhite);
  readonly removedBlack = new RemovedFigures(() => this.chess.removedBlack);

  #promise: ExplicitPromise<void> | undefined;
  readonly #showWin = (color: Color) => new ExplicitPromise<void>(
    () => {
      this.dialog.showModal();
    },
    async (resolve) => {
      await this.dialog.closeAsync('transform');
      resolve();
    },
  );

  win = async (color: Color) => {
    this.#promise = this.#showWin(color);
    return this.#promise;
  };

  ok() {
    this.#promise?.resolve();
  }

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
      .component('picker-view', PickerView)
      .component('removed-figures-view', RemovedFiguresView)
    ;

    this.chess.pick = this.picker.pick;
    this.chess.win = this.win;
  }

  run() {
    this.#vueApp.mount('#app');
  }

  reset() {
    this.chess.reset();
  }
}
