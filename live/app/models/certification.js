import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  date: attr('string'),
  certificationCenter: attr('string'),
  isPublished: attr('boolean'),
  pixScore: attr('number'),
  status: attr('string'),
  user: belongsTo('user'),
});
