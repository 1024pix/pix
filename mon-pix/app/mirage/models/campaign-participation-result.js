import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  campaignParticipationBadges: hasMany(),
  competenceResults: hasMany(),
  reachedStage: belongsTo(),
});
