import Ember from 'ember';

export function inc(params) {
  return params[0] + 1;
}

export default Ember.Helper.helper(inc);
