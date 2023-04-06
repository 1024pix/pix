import Model, { belongsTo, attr } from '@ember-data/model';

export default class CompetenceResult extends Model {
  // attributes
  @attr('string') areaColor;
  @attr('string') areaName;
  @attr('string') name;
  @attr('string') index;
  @attr('number') masteryPercentage;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('number') flashPixScore;

  @attr('number') reachedStage;

  // includes
  @belongsTo('campaignParticipationResult') campaignParticipationResult;

  get masteryRate() {
    return this.masteryPercentage / 100;
  }
}
