import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo('assessment', { inverse: 'answers' }),
  challenge: belongsTo('challenge', { inverse: 'answer' }),
  correction: belongsTo('correction', { inverse: null }),
  levelup: belongsTo('levelup', { inverse: null }),
});
