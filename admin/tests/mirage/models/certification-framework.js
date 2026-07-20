import { hasMany, Model } from 'miragejs';

export default Model.extend({
  versionSummaries: hasMany('certification-version-summary'),
  targetProfileSummaries: hasMany('certification-target-profile-summary'),
});
