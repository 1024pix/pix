import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  area: belongsTo(),
  tutorials: hasMany(),
});
