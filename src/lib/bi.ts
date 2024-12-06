import * as std from '@/lib/std';

export type MatElements = [number, number, number, number, number, number];

export class Vec {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec(this.x, this.y);
  }
}

export class Mat {
  static translation(x: number, y: number) {
    return new Mat(1, 0, 0, 1, x, y);
  }

  static rotation(angle: number) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return new Mat(cos, sin, -sin, cos, 0, 0);
  }

  static scale(x: number, y: number) {
    return new Mat(x, 0, 0, y, 0, 0);
  }

  static inverse(matrix: Mat) {
    const m = matrix.elements;
    const k = 1 / (m[0] * m[3] - m[1] * m[2]);
    return new Mat(
      m[3] * k,
      -m[1] * k,
      -m[2] * k,
      m[0] * k,
      (m[2] * m[5] - m[3] * m[4]) * k,
      (m[1] * m[4] - m[0] * m[5]) * k,
    );
  }

  readonly elements: MatElements;

  constructor(...elements: MatElements) {
    this.elements = elements;
  }

  clone() {
    return new Mat(...this.elements);
  }

  // source: https://drafts.csswg.org/css-transforms/#matrix-interpolation
  // NOTE: skew is not implemented
  decompose() {
    let x0 = this.elements[0];
    let y0 = this.elements[1];
    let x1 = this.elements[2];
    let y1 = this.elements[3];

    const translation = new Vec(this.elements[4], this.elements[5]);
    const scale = new Vec(Math.hypot(x0, y0), Math.hypot(x1, y1));

    // If determinant is negative, one axis was flipped.
    const determinant = x0 * y1 - y0 * x1;
    if (determinant < 0) {
      if (x0 < y1) scale.x = -scale.x;
      else scale.y = -scale.y;
    }

    // Renormalize matrix to remove scale.
    if (scale.x) {
      const k = 1 / scale.x;
      x0 *= k;
      y0 *= k;
    }
    if (scale.y) {
      const k = 1 / scale.y;
      x1 *= k;
      y1 *= k;
    }

    // Compute rotation and renormalize matrix.
    let rotation = Math.atan2(y0, x0);
    if (rotation < 0) rotation += 2 * Math.PI;

    return {
      translation,
      rotation,
      scale,
    };
  }

  multiply(m: Mat) {
    const a = this.elements;
    const b = m.elements;
    return new Mat(
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5],
    );
  }

  transform(v: Vec) {
    const m = this.elements;
    return new Vec(m[0] * v.x + m[2] * v.y + m[4], m[1] * v.x + m[3] * v.y + m[5]);
  }

  toCss() {
    return `matrix(${this.elements.join(' ')})`;
  }
}

export function mix(a: Vec, b: Vec, k: number) {
  return new Vec(std.mix(a.x, b.x, k), std.mix(a.y, b.y, k));
}

export function squareDistance(a: Vec, b: Vec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function distance(a: Vec, b: Vec) {
  return Math.sqrt(squareDistance(a, b));
}

export function squareLength(v: Vec) {
  return v.x * v.x + v.y * v.y;
}

export function length(v: Vec) {
  return Math.sqrt(squareLength(v));
}

export function normalize(v: Vec) {
  const k = 1 / length(v);
  return new Vec(v.x * k, v.y * k);
}

// source https://drafts.csswg.org/css-transforms/#matrix-interpolation
// NOTE: skew is not implemented
export function interpolate(m1: Mat, m2: Mat, k: number) {
  const a = m1.decompose();
  const b = m2.decompose();

  if (a.rotation > Math.PI) {
    a.rotation -= 2 * Math.PI;
  }

  if (b.rotation > Math.PI) {
    b.rotation -= 2 * Math.PI;
  }

  if ((a.scale.x < 0 && b.scale.y < 0) || (a.scale.y < 0 && b.scale.x < 0)) {
    a.scale.x = -a.scale.x;
    a.scale.y = -a.scale.y;
    a.rotation += a.rotation < 0 ? Math.PI : -Math.PI;
  }

  if (Math.abs(a.rotation - b.rotation) > Math.PI) {
    if (a.rotation > b.rotation) {
      a.rotation -= 2 * Math.PI;
    }
    else {
      b.rotation -= 2 * Math.PI;
    }
  }

  const t = mix(a.translation, b.translation, k);
  const r = std.mix(a.rotation, b.rotation, k);
  const s = mix(a.scale, b.scale, k);

  const m = Mat.translation(t.x, t.y)
    .multiply(Mat.rotation(r))
    .multiply(Mat.scale(s.x, s.y));

  return m;
}
