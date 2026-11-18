import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  campaignParticipation: belongsTo('campaignParticipation', { inverse: 'trainings' }),
});
