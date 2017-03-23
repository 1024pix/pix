import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';

export function eq(params) {
  let isEqual = false;
  if (_.isArray(params) && params.length > 0) {
    isEqual = (params[0] === params[1]) ? true : false;
  }
  return isEqual;
}

export default Ember.Helper.helper(eq);
