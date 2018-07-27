import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({

  duration: attr('string'),
  format: attr('string'),
  link: attr('string'),
  source: attr('string'),
  title: attr('string'),

});
