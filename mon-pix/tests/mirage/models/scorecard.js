import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  area: belongsTo('area', { inverse: null }),
  tutorials: hasMany('tutorial', { inverse: 'scorecard' }),
});
