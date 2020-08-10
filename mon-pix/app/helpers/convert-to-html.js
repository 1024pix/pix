import { helper } from '@ember/component/helper';
import showdown from 'showdown';
import _ from 'lodash';

export function convertToHtml(params) {
  if (_.isArray(params) && params.length > 0) {
    const converter = new showdown.Converter();
    return converter.makeHtml(params[0]);
  }
  return '';
}

export default helper(convertToHtml);
