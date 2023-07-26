/* eslint ember/no-classic-classes: 0 */

import Model, { attr, belongsTo } from '@ember-data/model';
import { equal, not } from '@ember/object/computed';
import ValueAsArrayOfString from './answer/value-as-array-of-string-mixin';

export default Model.extend(ValueAsArrayOfString, {
  value: attr('string'),
  result: attr('string'),
  resultDetails: attr('string'),
  timeout: attr('number'),
  focusedOut: attr('boolean'),
  assessment: belongsTo('assessment', { async: true, inverse: 'answers' }),
  challenge: belongsTo('challenge', { async: true, inverse: 'answer' }),
  correction: belongsTo('correction', { async: true, inverse: null }),
  levelup: belongsTo('levelup', { async: false, inverse: null }),

  isResultOk: equal('result', 'ok'),
  isResultNotOk: not('isResultOk'),
});
