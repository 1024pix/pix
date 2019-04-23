import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  description: attr('string'),
  index: attr('number'),
  area: belongsTo('area'),
  earnedPix: attr('number'),
  level: attr('number'),
  pixScoreAheadOfNextLevel: attr('number'),
});
