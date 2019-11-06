import DS from 'ember-data';
import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';
const { Model, attr, belongsTo, hasMany } = DS;
import areaColors from 'mon-pix/static-data/area-colors';

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

  areaColor: computed('area.code', function() {
    const areaCode = this.area.get('code').toString();
    const foundArea = areaColors.find((color) => color.area === areaCode);
    return foundArea.color;
  }),
});
