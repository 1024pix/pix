import { getScreen } from '@1024pix/ember-testing-library';

export function contains(text, options = { exact: false }) {
  const elements = getScreen().queryAllByText(text, options);

  if (elements.length > 0) {
    this.pushResult({ result: true, message: `Element with "${text}" found` });
  } else {
    this.pushResult({ result: false, message: `There is no elements with "${text}"` });
  }
}

export function notContains(text, options = { exact: false }) {
  const elements = getScreen().queryAllByText(text, options);

  if (elements.length > 0) {
    this.pushResult({ result: false, message: `Element with "${text}" found` });
  } else {
    this.pushResult({ result: true, message: `There is no elements with "${text}"` });
  }
}
