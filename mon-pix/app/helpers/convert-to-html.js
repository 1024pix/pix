import { helper } from '@ember/component/helper';
import showdown from 'showdown';
import xss from 'xss';
import isArray from 'lodash/isArray';

export function convertToHtml(params) {
  if (isArray(params) && params.length > 0) {
    const converter = new showdown.Converter();
    const filteredOutHtml = xss(params[0], {
      stripIgnoreTagBody: ['style'],
    });
    return converter.makeHtml(filteredOutHtml);
  }
  return '';
}

export default helper(convertToHtml);
