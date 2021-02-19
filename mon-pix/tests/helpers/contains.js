import { getRootElement } from '@ember/test-helpers';

export function contains(text) {
  const element = getRootElement();
  if (element.textContent.match(text)) return element;
  return null;
}
