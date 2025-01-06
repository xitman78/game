import { ExplicitPromise } from '@/lib/async';
import { Board } from '@/modules/chess/board';
import { Chess } from '@/modules/chess/chess';
import { Theme } from '@/modules/chess/theme';
import type { Color } from '@/modules/chess/types';
import { Dialog, State } from '@/ui/lib/dialog';

export class ChessGame {
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

  readonly dialog = new Dialog({ draggable: false, resizable: false });
  readonly themeDialog = new Dialog({ draggable: true, resizable: false });

  constructor() {
    this.chess.win = this.#win;
  }

  readonly theme = new Theme();

  get showTheme() {
    return this.themeDialog.state === State.NON_MODAL;
  }

  set showTheme(value) {
    if (value) {
      this.themeDialog.show();
    }
    else {
      this.themeDialog.closeAsync('transform');
    }
  }

  #promise: ExplicitPromise<void> | undefined;
  readonly #showWin = (color: Color) => new ExplicitPromise<void>(
    () => this.dialog.showModal(),
    async (resolve) => {
      await this.dialog.closeAsync('transform');
      resolve();
    },
  );

  #win = async (color: Color) => {
    this.#promise = this.#showWin(color);
    return this.#promise;
  };

  ok() {
    this.#promise?.resolve();
  }

  reset() {
    this.chess.reset();
  }
}
