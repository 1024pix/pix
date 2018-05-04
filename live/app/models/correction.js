import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({

  solution: attr('string'),
  hint: attr('string')

});
