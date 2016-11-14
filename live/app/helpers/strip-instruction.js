import Ember from 'ember';

export function stripInstruction(params) {
  let result = $(params[0]).text();
  result = result.substr(0, 70);
  result += '...';
  return result;
}

export default Ember.Helper.helper(stripInstruction);
