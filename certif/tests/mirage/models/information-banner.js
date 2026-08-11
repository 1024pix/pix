import { hasMany, Model } from 'miragejs';

export default Model.extend({
  banners: hasMany('banner'),
});
