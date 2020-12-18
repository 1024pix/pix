/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { equal, and } from '@ember/object/computed';
import { computed } from '@ember/object';
import ENV from 'mon-pix/config/environment';

const NUMBER_OF_PIX_BY_LEVEL = 8;
const MAX_DISPLAYED_PERCENTAGE = 95;

export default class Scorecard extends Model {
  @attr('string') description;
  @attr('number') earnedPix;
  @attr('number') index;
  @attr('number') level;
  @attr('string') name;
  @attr('number') pixScoreAheadOfNextLevel;
  @attr('number') remainingDaysBeforeReset;
  @attr('number') remainingDaysBeforeImproving;
  @attr('string') status;

  // references
  @attr('string') competenceId;

  // includes
  @belongsTo('area') area;
  @hasMany('tutorial') tutorials;

  // methods
  @and('isFinished', 'isMaxLevel') isFinishedWithMaxLevel;

  @equal('status', 'COMPLETED') isFinished;
  @equal('status', 'NOT_STARTED') isNotStarted;
  @equal('status', 'STARTED') isStarted;

  @computed('level')
  get isMaxLevel() {
    return this.level >= ENV.APP.MAX_REACHABLE_LEVEL;
  }

  @computed('earnedPix')
  get hasNotEarnAnything() {
    return this.earnedPix === 0;
  }

  @computed('level')
  get hasNotReachLevelOne() {
    return this.level < 1;
  }

  @computed('level')
  get hasReachAtLeastLevelOne() {
    return this.level >= 1;
  }

  @computed('pixScoreAheadOfNextLevel')
  get percentageAheadOfNextLevel() {
    const percentage = this.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100;

    return percentage >= MAX_DISPLAYED_PERCENTAGE ? MAX_DISPLAYED_PERCENTAGE : percentage;
  }

  @computed('pixScoreAheadOfNextLevel')
  get remainingPixToNextLevel() {
    return NUMBER_OF_PIX_BY_LEVEL - this.pixScoreAheadOfNextLevel;
  }
}
