/* global showdown */
import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';

export function convertToHtml(params) {
  if (_.isArray(params) && params.length > 0) {
    const converter = new showdown.Converter();
    return converter.makeHtml(params[0]);
  }
  return '';
}

export default Ember.Helper.helper(convertToHtml);
