import Model, { belongsTo, attr } from '@ember-data/model';
import { equal, not } from '@ember/object/computed';
import ValueAsArrayOfString from './answer/value-as-array-of-string-mixin';

export default Model.extend(ValueAsArrayOfString, {

  value: attr('string'),
  result: attr('string'),
  resultDetails: attr('string'),
  timeout: attr('number'),
  elapsedTime: attr('number'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge'),
  correction: belongsTo('correction'),
  levelup: belongsTo('levelup'),

  isResultOk: equal('result', 'ok'),
  isResultNotOk: not('isResultOk'),

});
