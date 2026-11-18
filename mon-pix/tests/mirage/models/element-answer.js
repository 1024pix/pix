import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  correction: belongsTo('correctionResponse', { inverse: null }),
  passage: belongsTo('passage', { inverse: 'elementAnswers' }),
});
