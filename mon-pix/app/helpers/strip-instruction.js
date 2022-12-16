import { helper } from '@ember/component/helper';
import truncate from 'lodash/truncate';

function strip(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function stripInstruction(params) {
  let length = 70;
  if (params[1]) {
    length = params[1];
  }
  const result = strip(params[0]);

  return truncate(result, {
    length,
    separator: ' ',
  });
}

export default helper(stripInstruction);
