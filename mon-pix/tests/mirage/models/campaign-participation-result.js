import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  campaignParticipationBadges: hasMany('campaignParticipationBadge', { inverse: 'campaignParticipationResult' }),
  competenceResults: hasMany('competenceResult', { inverse: 'campaignParticipationResult' }),
  reachedStage: belongsTo('reachedStage', { inverse: 'campaignParticipationResult' }),
});
