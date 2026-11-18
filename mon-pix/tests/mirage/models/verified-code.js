import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  campaign: belongsTo(),
  combinedCourse: belongsTo(),
});
