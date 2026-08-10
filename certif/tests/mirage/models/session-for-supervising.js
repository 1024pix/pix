import { hasMany, Model } from 'miragejs';

export default Model.extend({
  certificationCandidates: hasMany('certification-candidate-for-supervising'),
});
