import { Vec } from '@/lib/bi';
import { Item, it } from '@/lib/reactive';
import { Figure } from '@/modules/chess/figures';

export class Board {
  readonly root: Item;
  readonly figures: Figure[] = [];

  constructor() {
    this.root = it('svg', { viewBox: '0 0 8 8', transform: 'scale(1 -1)' });

    const board = it('g');
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const color = (x & 1) === (y & 1) ? 'dark' : 'light';
        board.add(it('rect', { x, y, width: 1, height: 1, class: color }));
      }
    }
    this.root.add(board);

    this.figures.push(
      new Figure('white', 'pawn', 0, 1),
      new Figure('white', 'rook', 0, 0),
      new Figure('black', 'pawn', 4, 6),
      new Figure('black', 'rook', 7, 7),
    );
    this.root.add(...this.figures.map(figure => figure.shape));

    // this.root.add(it('path', { class: 'black rook' }))
  }

  test(x: number, y: number) {
    this.figures[0].position = new Vec(x, y);
  }
}
