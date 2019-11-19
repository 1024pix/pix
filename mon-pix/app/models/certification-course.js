import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  nbChallenges: attr('number'),
  accessCode : attr('string'),
  assessment: belongsTo('assessment'),
});
