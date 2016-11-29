/* global showdown */
import Ember from 'ember';
import _ from 'lodash/lodash';

export function convertToHtml(params) {
  if (_.isArray(params) && params.length > 0) {
    let converter = new showdown.Converter();
    return converter.makeHtml(params[0]);
  }
  return '';
}

export default Ember.Helper.helper(convertToHtml);
