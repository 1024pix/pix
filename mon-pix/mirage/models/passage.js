import { hasMany, Model } from 'miragejs';

export default Model.extend({
  elementAnswers: hasMany(),
});
