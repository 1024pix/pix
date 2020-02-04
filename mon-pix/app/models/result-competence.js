import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  area: belongsTo('area'),
  index: attr('number'),
  level: attr('number'),
});
