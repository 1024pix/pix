import { helper } from '@ember/component/helper';
import showdown from 'showdown';
import isArray from 'lodash/isArray';

export function convertToHtml(params) {
  if (isArray(params) && params.length > 0) {
    const converter = new showdown.Converter();
    return converter.makeHtml(params[0]);
  }
  return '';
}

export default helper(convertToHtml);
