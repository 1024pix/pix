import { getRootElement } from '@ember/test-helpers';

function _isChildrenContainsText(element, text) {
  if (element.textContent.includes(text)) {
    return true;
  } else if (element.children.length > 0) {
    for (let i = 0; i < element.children.length; i++) {
      if (_isChildrenContainsText(element.children[i], text)) {
        return true;
      }
    }
  }
  return false;
}

export function contains(text) {
  const result = _isChildrenContainsText(getRootElement(), text);

  let message = `There is no elements with "${ text }"`;
  if (result) {
    message = `Element with "${ text }" found`;
  }

  this.pushResult({ result, message });
}

export function notContains(text) {
  const result = !_isChildrenContainsText(getRootElement(), text);

  let message = `Element with "${ text }" found`;
  if (result) {
    message = `There is no elements with "${ text }"`;
  }

  this.pushResult({ result, message });
}
