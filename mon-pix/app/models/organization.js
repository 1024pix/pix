import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  type: attr('string'),
  code: attr('string'),
  user: belongsTo('user'),
  snapshots: hasMany('snapshot')
});
