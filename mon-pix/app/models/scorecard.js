import DS from 'ember-data';
import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';
const { Model, attr, belongsTo } = DS;
import areaColors from 'mon-pix/static-data/area-colors';
import constants from 'mon-pix/static-data/constants-pix-and-level';

const MAX_DISPLAYED_PERCENTAGE = 95;

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

  isFinished: equal('status', 'COMPLETED'),
  isStarted: equal('status', 'STARTED'),
  isNotStarted: equal('status', 'NOT_STARTED'),

  pixScoreAheadOfNextLevelBlocked: computed('earnedPix', 'pixScoreAheadOfNextLevel', function() {
    return this.earnedPix < constants.MAX_REACHABLE_PIX_BY_COMPETENCE ? this.pixScoreAheadOfNextLevel : 0;
  }),

  earnedPixBlocked: computed('earnedPix', function() {
    return Math.min(this.earnedPix, constants.MAX_REACHABLE_PIX_BY_COMPETENCE);
  }),

  percentageAheadOfNextLevel: computed('pixScoreAheadOfNextLevelBlocked', function() {
    const percentage = this.pixScoreAheadOfNextLevelBlocked / constants.PIX_COUNT_BY_LEVEL * 100;

    return percentage >= MAX_DISPLAYED_PERCENTAGE ? MAX_DISPLAYED_PERCENTAGE : percentage;
  }),

  remainingPixToNextLevel: computed('pixScoreAheadOfNextLevelBlocked', function() {
    return constants.PIX_COUNT_BY_LEVEL - this.pixScoreAheadOfNextLevelBlocked;
  }),

  isMaxLevel: computed('level', function() {
    return this.level >= constants.MAX_REACHABLE_LEVEL;
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
