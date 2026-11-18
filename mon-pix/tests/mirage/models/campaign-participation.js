import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo('assessment', { inverse: null }),
  campaign: belongsTo('campaign', { inverse: null }),
  campaignParticipationResult: belongsTo('campaignParticipationResult', { inverse: null }),
  user: belongsTo('user', { inverse: null }),
  trainings: hasMany('training', { inverse: 'campaignParticipation' }),
});
