import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  course: belongsTo('course')
});
