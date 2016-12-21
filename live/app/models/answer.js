import Ember from 'ember';
import DS from 'ember-data';
import ValueAsArrayOfBoolean from './answer/value-as-array-of-boolean-mixin';
import ValueAsArrayOfString from './answer/value-as-array-of-string-mixin';

const { Model, attr, belongsTo } = DS;
const { computed } = Ember;

export default Model.extend(ValueAsArrayOfBoolean, ValueAsArrayOfString, {

  value: attr('string'),
  result: attr('string'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge'),

  isResultOk: computed('result', function () {
    return this.get('result') === 'ok';
  }),
  isResultWithoutAnswer: computed('result', function () {
    return this.get('result') === 'aband';
  }),
  isResultPartiallyOk: computed('result', function () {
    return this.get('result') === 'partially';
  }),
  isResultNotOk: computed('result', function () {
    return this.get('result') === 'ko';
  })

});
