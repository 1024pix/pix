import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

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
  @attr('boolean') isFinishedWithMaxLevel;
  @attr('boolean') isFinished;
  @attr('boolean') isNotStarted;
  @attr('boolean') isStarted;
  @attr('boolean') isMaxLevel;
  @attr('boolean') isProgressable;
  @attr('boolean') isImprovable;
  @attr('boolean') shouldWaitBeforeImproving;
  @attr('boolean') isResettable;
  @attr('boolean') hasNotEarnedAnything;
  @attr('boolean') hasNotReachedLevelOne;
  @attr('boolean') hasReachedAtLeastLevelOne;
  @attr('number') percentageAheadOfNextLevel;
  @attr('number') remainingPixToNextLevel;

  // references
  @attr('string') competenceId;

  // includes
  @belongsTo('area', { async: false, inverse: null }) area;
  @hasMany('tutorial', { async: true, inverse: 'scorecard' }) tutorials;

  // methods
  get capedPercentageAheadOfNextLevel() {
    return this.percentageAheadOfNextLevel >= MAX_DISPLAYED_PERCENTAGE
      ? MAX_DISPLAYED_PERCENTAGE
      : this.percentageAheadOfNextLevel;
  }
}
