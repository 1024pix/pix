import Model, { belongsTo } from '@ember-data/model';

export default Model.extend({
  user: belongsTo('user'),
  certificationCenter: belongsTo('certificationCenter')
});
