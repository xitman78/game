import { Item, it } from '@/lib/reactive';
import { Pawn } from '@/modules/chess/figures';

export class Board {
  readonly root: Item;
  readonly whitePawn: Pawn;
  readonly blackPawn: Pawn;

  constructor() {
    this.root = it('svg', { viewBox: '0 0 8 8', transform: 'scale(1 -1)' });
    const board = it('g');
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const color = (x & 1) === (y & 1) ? 'dark' : 'light';
        board.add(it('rect', { x, y, width: 1, height: 1, class: color }));
      }
    }
    this.whitePawn = new Pawn('white', 0, 1);
    this.blackPawn = new Pawn('black', 4, 6);
    this.root.add(board, this.whitePawn.shape, this.blackPawn.shape);
  }

  test(x: number, y: number) {
    this.whitePawn.x = x;
    this.whitePawn.y = y;
  }
}
