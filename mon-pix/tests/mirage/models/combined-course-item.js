import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  combinedCourse: belongsTo('combinedCourse', { inverse: 'items' }),
});
