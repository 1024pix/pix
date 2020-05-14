import { getRootElement } from '@ember/test-helpers';

function getChildrenThatContainsText(element, text) {
  if (element.children.length === 0) {
    if (element.textContent.trim() === text) {
      return element;
    }
    return null;
  }

  return [...element.children]
    .map((child) => {
      return getChildrenThatContainsText(child, text);
    })
    .filter(Boolean)
    .flatMap((v) => v);
}

export function contains(text) {
  const result = getChildrenThatContainsText(getRootElement(), text);
  if (result.length > 0) {
    return result[0];
  }
  return null;
}

export function containsAll(text) {
  return getChildrenThatContainsText(getRootElement(), text);
}

