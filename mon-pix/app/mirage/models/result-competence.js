import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  area: belongsTo(),
});
