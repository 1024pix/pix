import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  nbChallenges: attr('number'),
  accessCode : attr('string'),
  sessionId : attr('number'),
  assessment: belongsTo('assessment'),
});
