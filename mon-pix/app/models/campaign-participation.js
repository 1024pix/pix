import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  isShared: attr('boolean'),
  participantExternalId: attr('string'),
  createdAt: attr('date'),
  assessment: belongsTo('assessment'),
  campaign: belongsTo('campaign'),
  campaignParticipationResult: belongsTo('campaignParticipationResult'),
  user: belongsTo('user'),
});
