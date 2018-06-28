import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({

  duration: attr('string'),
  format: attr('string'),
  link: attr('string'),
  source: attr('string'),
  title: attr('string'),
  correction: hasMany('correction'),

});
