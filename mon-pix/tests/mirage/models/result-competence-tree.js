import { hasMany, Model } from 'miragejs';

export default Model.extend({
  areas: hasMany('area', { inverse: null }),
});
