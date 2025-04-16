import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  assessment: belongsTo(),
  challenge: belongsTo(),
});
