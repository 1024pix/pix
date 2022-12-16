import { getRootElement } from '@ember/test-helpers';

export function contains(text) {
  const element = getRootElement();
  if (element.innerText.includes(text)) return element;
  return null;
}
