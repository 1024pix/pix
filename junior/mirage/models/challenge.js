import { hasMany, Model } from 'miragejs';

export default Model.extend({
  activityAnswers: hasMany(),
});
