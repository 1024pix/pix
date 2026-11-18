import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  isCertifiable: belongsTo('isCertifiable', { inverse: null }),
  profile: belongsTo('profile', { inverse: null }),
  accountInfo: belongsTo('accountInfo', { inverse: null }),
  certifications: hasMany('certification', { inverse: 'user' }),
  scorecards: hasMany('scorecard', { inverse: null }),
  trainings: hasMany('training', { inverse: null }),
});
