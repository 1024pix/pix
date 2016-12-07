import Ember from 'ember';
import _ from 'lodash/lodash';

export function propertyOf(params) {
  const map = params[0];
  const key = params[1];
  if (_.isObject(map) && _.isString(key)) {
    return map[key];
  }
  return '';
}

export default Ember.Helper.helper(propertyOf);
