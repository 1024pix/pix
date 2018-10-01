import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  code: attr('string'),
  idPixLabel: attr('string'),
});
