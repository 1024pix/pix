import { hasMany, Model } from 'miragejs';

export default Model.extend({
  badgeSummaries: hasMany('certification-badge-summary'),
});
