import { hasMany, Model } from 'miragejs';

export default Model.extend({
  tutorials: hasMany('tutorial', { inverse: null }),
  learningMoreTutorials: hasMany('tutorial', { inverse: null }),
});
