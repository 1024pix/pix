import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';

function _isATruthyValue(value) {
  return _.isTruthy(value) && value === true;
}

export function or(params) {
  let hasTruthyValue = false;
  if (_.isArray(params) && params.length > 1) {
    hasTruthyValue = (_isATruthyValue(params[0]) || _isATruthyValue(params[1])) ? true : false;
  }
  return hasTruthyValue;
}

export default Ember.Helper.helper(or);
