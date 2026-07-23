import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  versionSummaries: hasMany('certification-version-summary'),
  complementaryCertification: belongsTo('complementary-certification'),
});
