import DS from 'ember-data';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  birthdate: attr('date'),
  firstName: attr('string'),
  lastName: attr('string'),
  date: attr('date'),
  certificationCenter: attr('string'),
  isPublished: attr('boolean'),
  pixScore: attr('number'),
  status: attr('string'),
  user: belongsTo('user'),
  commentForCandidate: attr('string'),
  certifiedProfile: attr(),
});
