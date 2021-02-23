import { getRootElement } from '@ember/test-helpers';

export default function findByLabel(labelText) {
  return _getChildrenThatContainsText(getRootElement(), labelText);
}

function _getChildrenThatContainsText(element, text) {
  const children = [...element.children];
  if (children.length === 0) {
    if (element.textContent.match(text)) {
      return element;
    } else {
      return null;
    }
  }
  return children
    .map((child) => _getChildrenThatContainsText(child, text))
    .find(Boolean);
}
