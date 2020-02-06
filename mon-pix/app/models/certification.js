import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  birthdate: attr('date-only'),
  birthplace: attr('string'),
  firstName: attr('string'),
  lastName: attr('string'),
  date: attr('date'),
  certificationCenter: attr('string'),
  isPublished: attr('boolean'),
  pixScore: attr('number'),
  status: attr('string'),
  user: belongsTo('user'),
  commentForCandidate: attr('string'),
  resultCompetenceTree: belongsTo('resultCompetenceTree'),
});
