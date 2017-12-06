import Course from './course';
import DS from 'ember-data';
const { belongsTo } = DS;

export default Course.extend({
  assessment: belongsTo('assessment'),
  type : 'CERTIFICATION'
});
