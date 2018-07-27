import { helper } from '@ember/component/helper';
import $ from 'jquery';

export function stripInstruction(params) {
  let result = $(params[0]).text();
  result = result.substr(0, 70);
  result += '...';
  return result;
}

export default helper(stripInstruction);
