import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  certificationReport: belongsTo('certification-report'),
});
