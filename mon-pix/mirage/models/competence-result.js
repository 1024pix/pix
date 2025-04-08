import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  campaignParticipationResult: belongsTo(),
});
