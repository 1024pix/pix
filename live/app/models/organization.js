import DS from 'ember-data';
const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  name: attr('string'),
  email: attr('string'),
  type: attr('string'),
  code: attr('string'),
  user: belongsTo('user'),
  snapshots : hasMany('snapshot')
});
