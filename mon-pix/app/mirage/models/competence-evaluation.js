import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo(),
  scorecard: belongsTo(),
  user: belongsTo(),
});
