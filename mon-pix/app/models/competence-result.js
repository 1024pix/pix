import Model, { belongsTo, attr } from '@ember-data/model';

export default class CompetenceResult extends Model {
  // attributes
  @attr('string') areaColor;
  @attr('string') areaTitle;
  @attr('string') name;
  @attr('string') index;
  @attr('number') masteryPercentage;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('number') flashPixScore;

  @attr('number') reachedStage;

  // includes
  @belongsTo('campaignParticipationResult', { async: true, inverse: 'competenceResults' }) campaignParticipationResult;

  get masteryRate() {
    return this.masteryPercentage / 100;
  }

  get acquiredStagesCount() {
    // We subtract 1 to not display the "zero" level which does not provide information to the user
    return this.reachedStage - 1;
  }
}
