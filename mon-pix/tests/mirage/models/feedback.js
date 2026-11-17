import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo('assessment', { inverse: null }),
  challenge: belongsTo('challenge', { inverse: null }),
});
