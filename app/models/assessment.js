import Model from 'ember-data/model';
// import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
//import { Course } from 'pix-live/app/models/course.js';

export default Model.extend({
  course: belongsTo('course')
});
