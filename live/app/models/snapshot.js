import DS from 'ember-data';

const { Model, belongsTo, attr } = DS;

export default Model.extend({
  completionPercentage: attr('string'),
  score: attr('number'),
  createdAt: attr('date'),
  organization: belongsTo('organization'),
  user: belongsTo('user'),
  studentCode: attr('string'),
  campaignCode: attr('string')
});
