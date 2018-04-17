import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  date: attr('string'),
  status: attr('string'),
  score: attr('string'),
  certificationCenter: attr('string'),
  user: belongsTo('user'),

});
