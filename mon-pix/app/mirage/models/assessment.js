import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  answers: hasMany(),
  certificationCourse: belongsTo(),
  course: belongsTo(),
  progression: belongsTo(),
});
