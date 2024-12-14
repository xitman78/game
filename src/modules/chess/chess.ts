import { shallowReactive } from 'vue';
import type { Figure } from '@/modules/chess/figures';

export class Chess {
  readonly figures = shallowReactive<Figure[]>([]);
}
