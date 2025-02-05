import { computed, reactive, ref, type CSSProperties } from 'vue';

export class RgbColor {
  #r = ref(0);
  #g = ref(0);
  #b = ref(0);

  constructor(r = 0, g = 0, b = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  get r() {
    return this.#r.value;
  }

  set r(value) {
    this.#r.value = value;
  }

  get g() {
    return this.#g.value;
  }

  set g(value) {
    this.#g.value = value;
  }

  get b() {
    return this.#b.value;
  }

  set b(value) {
    this.#b.value = value;
  }

  get value() {
    return `${this.r} ${this.g} ${this.b}`;
  }

  lighten(percent: number): string {
    const factor = 1 + percent;
    const r = Math.min(255, Math.round(this.r * factor));
    const g = Math.min(255, Math.round(this.g * factor));
    const b = Math.min(255, Math.round(this.b * factor));
    return `${r} ${g} ${b}`;
  }
}

export class Theme {
  readonly light = new RgbColor(171, 194, 194);
  readonly dark = new RgbColor(21, 85, 111);

  readonly #style = reactive({
    '--light': computed(() => this.light.value),
    '--dark': computed(() => this.dark.value),
    '--light-hover': computed(() => this.light.lighten(0.3)),
    '--dark-hover': computed(() => this.dark.lighten(0.3)),
  });

  get style() {
    return this.#style as CSSProperties;
  }

  save() {
    // console.log(JSON.stringify(this.#style));
    localStorage.setItem('theme', JSON.stringify(this.#style));
  }

  load() {
    const value = localStorage.getItem('theme') || '{}';
    const theme = JSON.parse(value);
    if (theme['--light']) {
      const [r, g, b] = (theme['--light'] as string).split(' ').map(v => Number.parseInt(v));
      this.light.r = r;
      this.light.g = g;
      this.light.b = b;
    }
    if (theme['--dark']) {
      const [r, g, b] = (theme['--dark'] as string).split(' ').map(v => Number.parseInt(v));
      this.dark.r = r;
      this.dark.g = g;
      this.dark.b = b;
    }
  }

  reset() {
    this.light.r = 128;
    this.light.g = 128;
    this.light.b = 128;
    this.dark.r = 4;
    this.dark.g = 48;
    this.dark.b = 104;
  }
}
