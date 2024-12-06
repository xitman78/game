import { ref, shallowReactive } from 'vue';

import * as std from '@/lib/std';

export type Attributes = {
  id?: string;
  href?: string;
  class?: string;
  [key: string]: string | number | undefined;
};

export class Item {
  readonly key = Symbol();
  readonly tag: string;
  readonly attributes = shallowReactive<Attributes>({});
  readonly items = shallowReactive<Item[]>([]);

  readonly #text = ref<string | undefined>();
  readonly #events = new Map<
    keyof HTMLElementEventMap,
    {
      listener: (this: HTMLElement, e: any) => void;
      options?: boolean | AddEventListenerOptions;
    }[]
  >();

  #element?: HTMLElement;
  #parent?: Item;

  constructor(tag: string, data?: Attributes | string | Item[], children?: Item[]) {
    this.tag = tag;
    if (data) {
      if (Array.isArray(data)) {
        if (data.length > 0) {
          this.add(...data);
        }
      }
      else if (typeof data === 'string') {
        this.text = data;
      }
      else {
        Object.assign(this.attributes, data);
      }
    }
    if (children) {
      this.add(...children);
    }
  }

  get text() {
    return this.#text.value;
  }

  set text(value) {
    this.#text.value = value;
  }

  get parent() {
    return this.#parent;
  }

  get element() {
    return this.#element;
  }

  get index() {
    return this.parent ? this.parent.items.indexOf(this) : 0;
  }

  set index(toIndex: number) {
    if (this.parent) {
      this.parent.move(this, toIndex);
    }
  }

  clear() {
    this.items.forEach(item => (item.#parent = undefined));
    this.items.length = 0;
  }

  add(...items: Item[]) {
    items.forEach((item) => {
      if (item.parent) {
        item.parent.remove(item);
      }
      item.#parent = this;
      this.items.push(item);
    });
  }

  remove(item: Item) {
    const index = this.items.indexOf(item);
    this.items.splice(index, 1);
    item.#parent = undefined;
  }

  move(item: Item, toIndex: number) {
    const index = this.items.indexOf(item);
    if (index === -1) {
      return;
    }
    if (toIndex < 0) {
      toIndex += this.items.length;
    }
    toIndex = std.clamp(toIndex, 0, this.items.length - 1);
    if (index !== toIndex) {
      this.items.splice(index, 1);
      this.items.splice(toIndex, 0, item);
    }
  }

  find(id: string): Item | undefined {
    if (this.attributes.id === id) {
      return this;
    }
    for (const item of this.items) {
      const result = item.find(id);
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  findByClass(name: string): Item | undefined {
    if (
      this.attributes.class !== undefined
      && (this.attributes.class as string).split(' ').includes(name)
    ) {
      return this;
    }
    for (const item of this.items) {
      const result = item.findByClass(name);
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  on<EventType extends keyof HTMLElementEventMap>(
    type: EventType,
    listener: (this: HTMLElement, e: HTMLElementEventMap[EventType]) => void,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (!this.#events.has(type)) {
      this.#events.set(type, []);
    }

    const listeners = this.#events.get(type)!;
    if (listeners.find(item => item.listener === listener)) {
      return;
    }

    listeners.push({ listener, options });
    if (this.#element) {
      this.#element.addEventListener(type, listener, options);
    }
  }

  off<EventType extends keyof HTMLElementEventMap>(
    event?: EventType,
    listener?: (this: HTMLElement, e: HTMLElementEventMap[EventType]) => void,
  ) {
    if (!event) {
      if (this.#element) {
        this.#events.forEach((listeners, event) =>
          listeners.forEach(item => this.#element!.removeEventListener(event, item.listener)),
        );
      }
      this.#events.clear();
      return;
    }

    if (!this.#events.has(event)) {
      return;
    }

    const listeners = this.#events.get(event)!;
    if (!listener) {
      if (this.#element) {
        listeners.forEach(item => this.#element!.removeEventListener(event, item.listener));
      }
      this.#events.delete(event);
    }
    else {
      const index = listeners.findIndex(item => item.listener === listener);
      if (index !== -1) {
        if (this.#element) {
          this.#element.removeEventListener(event, listener);
        }
        listeners.splice(index, 1);
      }
    }
  }

  mount(element: HTMLElement) {
    this.unmount();
    this.#element = element;
    if (this.#element) {
      this.#events.forEach((listeners, event) =>
        listeners.forEach(item =>
          this.#element!.addEventListener(event, item.listener, item.options),
        ),
      );
    }
  }

  unmount() {
    if (this.#element) {
      this.#events.forEach((listeners, event) =>
        listeners.forEach(item => this.#element!.removeEventListener(event, item.listener)),
      );
      this.#element = undefined;
    }
  }
}

export function it(tag: string, data?: string | Attributes | Item[], children?: Item[]) {
  return new Item(tag, data, children);
}

export function fromElement(
  node: Node,
  createItem?: (tag: string, data: Attributes | string) => Item,
) {
  if (!createItem) {
    createItem = (tag, data) => new Item(tag, data);
  }

  if (node.nodeType === node.TEXT_NODE) {
    const text = (node.nodeValue || '').trim();
    return text.length > 0 ? createItem(node.nodeName, text) : undefined;
  }
  else if (node instanceof Element) {
    const attributes: Attributes = {};
    for (const attr of node.attributes) {
      attributes[attr.name] = attr.value;
    }
    const item = createItem(node.nodeName, attributes);
    for (const child of node.childNodes) {
      const childItem = fromElement(child, createItem);
      if (childItem) {
        item.add(childItem);
      }
    }
    return item;
  }

  return undefined;
}

export function fromSource(
  text: string,
  createItem?: (tag: string, data: Attributes | string) => Item,
) {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'image/svg+xml');
  return fromElement(document.documentElement, createItem);
}
