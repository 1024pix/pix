import DS from 'ember-data';
import ValueAsArrayOfString from './answer/value-as-array-of-string-mixin';

const { Model, attr, belongsTo } = DS;

export default Model.extend(ValueAsArrayOfString, {

  value: attr('string'),
  result: attr('string'),
  resultDetails: attr('string'),
  timeout: attr('number'),
  elapsedTime: attr('number'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge')
});
