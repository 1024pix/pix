import DS from 'ember-data';
import { equal } from '@ember/object/computed';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  description: attr('string'),
  index: attr('number'),
  competenceId: attr('string'),
  area: belongsTo('area'),
  earnedPix: attr('number'),
  level: attr('number'),
  pixScoreAheadOfNextLevel: attr('number'),
  status: attr('string'),

  isFinished: equal('status', 'COMPLETED'),
  isStarted: equal('status', 'STARTED'),
  isNotStarted: equal('status', 'NOT_STARTED'),
});
