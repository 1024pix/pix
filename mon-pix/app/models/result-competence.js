import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  area: belongsTo('area'),
  index: attr('number'),
  level: attr('number'),
});
