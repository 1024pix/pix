import DS from 'ember-data';
import ValueAsArrayOfBooleanMixin from './answer/value-as-array-of-boolean-mixin';

const { Model, attr } = DS;

export default Model.extend(ValueAsArrayOfBooleanMixin, {

  value: attr('string')

});
