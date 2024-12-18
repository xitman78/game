export type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;

export type PromiseRejector = (reason?: any) => void;

export type PromiseExecutor<T> = (resolve: PromiseResolver<T>, reject: PromiseRejector) => void;

export class ExplicitPromise<T = void> extends Promise<T> {
  readonly #resolver: PromiseResolver<T>;
  readonly #rejector: PromiseRejector;

  readonly #resolveCallback: (resolver: PromiseResolver<T>, value: T | PromiseLike<T>) => void;
  readonly #rejectCallback: (rejector: PromiseRejector, reason?: any) => void;

  constructor(
    executor: PromiseExecutor<T>,
    resolveCallback?: (resolver: PromiseResolver<T>, value: T | PromiseLike<T>) => void,
    rejectCallback?: (rejector: PromiseRejector, reason?: any) => void,
  ) {
    let resolver!: PromiseResolver<T>;
    let rejector!: PromiseRejector;
    super((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    this.#resolver = resolver;
    this.#rejector = rejector;
    this.#resolveCallback = resolveCallback || ((resolve, value) => resolve(value));
    this.#rejectCallback = rejectCallback || ((reject, reason) => reject(reason));
    executor(this.#resolver, this.#rejector);
  }

  readonly resolve = (value: T | PromiseLike<T>) => {
    this.#resolveCallback(this.#resolver, value);
  };

  readonly reject = (reason?: any) => {
    this.#rejectCallback(this.#rejector, reason);
  };
}
