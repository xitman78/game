// https://stackoverflow.com/a/30753870
const focusable = [
  '[contentEditable=true]',
  '[tabindex]',
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
].map(selector => `${selector}:not([tabindex='-1'])`).join(',');

/**
 * Returns focusable children of given root element, in document order.
 * @param root root element.
 * @returns focusable children.
 */
export function getFocusableChildren(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(focusable)];
}

function getFocusedChild(root: HTMLElement) {
  const current = document.activeElement;
  if (!current) return {};

  const children = getFocusableChildren(root);
  const index = children.findIndex(element => (element === current));
  if (index === -1) {
    return {};
  }

  return { index, children };
}

export type FocusOptions = {
  cycle?: boolean;
};

export function focusPrevChild(root: HTMLElement, options?: FocusOptions) {
  const { index, children } = getFocusedChild(root);
  if (!children) return;

  if (index === 0 && !options?.cycle) return;

  const to = index > 0 ? index - 1 : children.length - 1;
  children[to].focus();
}

export function focusNextChild(root: HTMLElement, options?: FocusOptions) {
  const { index, children } = getFocusedChild(root);
  if (!children) return;

  if (index === children.length - 1 && !options?.cycle) return;

  const to = index < children.length - 1 ? index + 1 : 0;
  children[to].focus();
}
