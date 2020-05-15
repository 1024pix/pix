import QUnit from 'qunit';
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

QUnit.assert.contains  = function(text) {
  const elements = getChildrenThatContainsText(getRootElement(), text);
  const result = elements.length > 0;

  let message = `There is no elements with "${ text }"`;
  if (result) {
    message = `Element with "${ text }" found`;
  }

  this.pushResult({
    result,
    message
  });
};

QUnit.assert.notContains  = function(text) {
  const elements = getChildrenThatContainsText(getRootElement(), text);
  const result = elements.length === 0;

  let message = `Element with "${ text }" found`;
  if (result) {
    message = `There is no elements with "${ text }"`;
  }

  this.pushResult({
    result,
    message
  });
};
