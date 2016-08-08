import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  course: belongsTo('course'),
  challenges: hasMany('challenge')
});
