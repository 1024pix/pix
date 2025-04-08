import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  correction: belongsTo('correction-response'),
  passage: belongsTo(),
});
