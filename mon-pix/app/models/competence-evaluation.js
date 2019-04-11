import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  assessment: belongsTo('assessment'),
  competence: belongsTo('competence'),
  competenceId: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  user: belongsTo('user'),
});
