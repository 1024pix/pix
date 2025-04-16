import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo(),
  campaign: belongsTo(),
  campaignParticipationResult: belongsTo(),
  user: belongsTo(),
  trainings: hasMany(),
});
