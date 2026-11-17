import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  answer: belongsTo('answer', { inverse: 'challenge' }),
});
