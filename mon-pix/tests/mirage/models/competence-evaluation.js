import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo('assessment', { inverse: null }),
  scorecard: belongsTo('scorecard', { inverse: null }),
  user: belongsTo('user', { inverse: null }),
});
