import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  competenceId: attr('string'),
  status: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  user: belongsTo('user'),

  assessment: belongsTo('assessment'),
  competence: belongsTo('competence'),
  scorecard: belongsTo('scorecard', { async: false }),
});
