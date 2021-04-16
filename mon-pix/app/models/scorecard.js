import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
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
  get isFinishedWithMaxLevel() {
    return this.isFinished && this.isMaxLevel;
  }

  get isFinished() {
    return this.status === 'COMPLETED';
  }

  get isNotStarted() {
    return this.status === 'NOT_STARTED';
  }

  get isStarted() {
    return this.status === 'STARTED';
  }

  get isMaxLevel() {
    return this.level >= ENV.APP.MAX_REACHABLE_LEVEL;
  }

  get isImprovable() {
    return this.isFinished && !this.isFinishedWithMaxLevel && this.remainingDaysBeforeImproving === 0;
  }

  get hasNotEarnAnything() {
    return this.earnedPix === 0;
  }

  get hasNotReachLevelOne() {
    return this.level < 1;
  }

  get hasReachAtLeastLevelOne() {
    return this.level >= 1;
  }

  get percentageAheadOfNextLevel() {
    const percentage = this.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100;

    return percentage >= MAX_DISPLAYED_PERCENTAGE ? MAX_DISPLAYED_PERCENTAGE : percentage;
  }

  get remainingPixToNextLevel() {
    return NUMBER_OF_PIX_BY_LEVEL - this.pixScoreAheadOfNextLevel;
  }
}
