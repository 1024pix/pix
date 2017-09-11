import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  user: belongsTo('user', { inverse: null }),
  snapshots : hasMany('snapshot')
});
