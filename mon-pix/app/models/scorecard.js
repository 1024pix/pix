import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { equal, and } from '@ember/object/computed';
import { computed } from '@ember/object';

const NUMBER_OF_PIX_BY_LEVEL = 8;
const MAX_DISPLAYED_PERCENTAGE = 95;
const MAX_REACHABLE_LEVEL = 5;

export default Model.extend({
  name: attr('string'),
  description: attr('string'),
  index: attr('number'),
  competenceId: attr('string'),
  earnedPix: attr('number'),
  level: attr('number'),
  pixScoreAheadOfNextLevel: attr('number'),
  status: attr('string'),
  remainingDaysBeforeReset: attr('number'),

  area: belongsTo('area'),
  tutorials: hasMany('tutorial'),

  isFinished: equal('status', 'COMPLETED'),
  isFinishedWithMaxLevel: and('isFinished', 'isMaxLevel'),
  isStarted: equal('status', 'STARTED'),
  isNotStarted: equal('status', 'NOT_STARTED'),

  percentageAheadOfNextLevel: computed('pixScoreAheadOfNextLevel', function() {
    const percentage = this.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100;

    return percentage >= MAX_DISPLAYED_PERCENTAGE ? MAX_DISPLAYED_PERCENTAGE : percentage;
  }),

  remainingPixToNextLevel: computed('pixScoreAheadOfNextLevel', function() {
    return NUMBER_OF_PIX_BY_LEVEL - this.pixScoreAheadOfNextLevel;
  }),

  isMaxLevel: computed('level', function() {
    return this.level >= MAX_REACHABLE_LEVEL;
  }),

  hasNotEarnAnything: computed('earnedPix', function() {
    return this.earnedPix === 0;
  }),

  hasNotReachLevelOne: computed('level', function() {
    return this.level < 1;
  }),

  hasReachAtLeastLevelOne: computed('level', function() {
    return this.level >= 1;
  }),
});
