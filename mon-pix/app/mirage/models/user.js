import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  isCertifiable: belongsTo(),
  profile: belongsTo(),
  accountInfo: belongsTo(),
  certifications: hasMany(),
  scorecards: hasMany(),
  trainings: hasMany(),
});
