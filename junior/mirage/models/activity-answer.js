import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  challenge: belongsTo(),
});
