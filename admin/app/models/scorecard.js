import Model, { attr } from '@ember-data/model';

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
}
