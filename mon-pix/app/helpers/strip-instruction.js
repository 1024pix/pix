import { helper } from '@ember/component/helper';
import $ from 'jquery';
import truncate from 'lodash/truncate';

export function stripInstruction(params) {
  let length = 70;
  if (params[1]) {
    length = params[1];
  }
  const result = $(params[0]).text();

  return truncate(result, {
    length,
    separator: ' ',
  });
}

export default helper(stripInstruction);
