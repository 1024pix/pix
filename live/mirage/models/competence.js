import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  area: belongsTo('area', { inverse: null }),
  user: belongsTo('user'),
});
