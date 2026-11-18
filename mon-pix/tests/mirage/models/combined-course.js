import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  items: hasMany('combinedCourseItem', { inverse: 'combinedCourse' }),
  reward: belongsTo('combinedCourseReward', { inverse: null }),
});
