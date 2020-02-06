import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  nbChallenges: attr('number'),
  accessCode : attr('string'),
  sessionId : attr('number'),
  assessment: belongsTo('assessment'),
});
