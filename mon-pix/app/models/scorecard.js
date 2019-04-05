import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  index: attr('number'),
  courseId: attr('string'),
  area: belongsTo('area'),
  earnedPix: attr('number'),
  level: attr('number'),
  pixScoreAheadOfNextLevel: attr('number'),
});
