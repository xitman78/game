import { createApp, type App as VueApp } from 'vue';

// ui componnents
import UiButton from '@/ui/button.vue';
import UiDialog from '@/ui/dialog.vue';
import UiIcon from '@/ui/icon.vue';
import UiItem from '@/ui/item.vue';
import UiRange from '@/ui/range.vue';

// views
import AppView from './app-view.vue';
import ChessGameView from '@/modules/chess/chess-game-view.vue';
import BoardView from '@/modules/chess/board-view.vue';
import PickerView from '@/modules/chess/picker-view.vue';
import RemovedFiguresView from '@/modules/chess/removed-figures-view.vue';
import ThemeView from '@/modules/chess/theme-view.vue';

import { ChessGame } from '@/modules/chess/chess-game';

export class App {
  readonly #vueApp: VueApp;
  readonly chessGame = new ChessGame();

  constructor() {
    this.#vueApp = createApp(AppView, { model: this });
    this.#vueApp
      // ui
      .component('ui-button', UiButton)
      .component('ui-dialog', UiDialog)
      .component('ui-icon', UiIcon)
      .component('ui-item', UiItem)
      .component('ui-range', UiRange)
      // views
      .component('chess-game-view', ChessGameView)
      .component('board-view', BoardView)
      .component('picker-view', PickerView)
      .component('removed-figures-view', RemovedFiguresView)
      .component('theme-view', ThemeView)
    ;
  }

  run() {
    this.#vueApp.mount('#app');
  }
}
