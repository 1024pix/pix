import { hasMany, Model } from 'miragejs';

export default Model.extend({
  sections: hasMany('section', { inverse: 'module' }),
});
