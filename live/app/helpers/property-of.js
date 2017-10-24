import { helper } from '@ember/component/helper';
import _ from 'pix-live/utils/lodash-custom';

export function propertyOf(params) {
  const map = params[0];
  const key = params[1];
  if (_.isObject(map) && _.isString(key)) {
    return map[key];
  }
  return '';
}

export default helper(propertyOf);
