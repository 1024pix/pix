import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  answers: hasMany('answer', { inverse: 'assessment' }),
  certificationCourse: belongsTo('certificationCourse', { inverse: 'assessment' }),
  course: belongsTo('course', { inverse: null }),
  progression: belongsTo('progression', { inverse: null }),
  nextChallenge: belongsTo('challenge', { inverse: null }),
  campaign: belongsTo('campaign', { inverse: null }),
});
