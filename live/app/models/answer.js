import DS from 'ember-data';
import ValueAsArrayOfBoolean from './answer/value-as-array-of-boolean-mixin';
import ValueAsArrayOfString from './answer/value-as-array-of-string-mixin';

const { Model, attr, belongsTo } = DS;

export default Model.extend(ValueAsArrayOfBoolean, ValueAsArrayOfString, {

  value: attr('string'),
  result: attr('string'),
  resultDetails : attr('string'),
  timeout: attr('number'),
  elapsedTime: attr('number'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge')
});
