import { hasMany, Model } from 'miragejs';

export default Model.extend({
  certificationReports: hasMany('certification-report'),
});
