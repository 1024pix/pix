import Model, { attr, belongsTo } from '@ember-data/model';

export default class CampaignAssessmentParticipationCompetenceResult extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('string') areaColor;
  @attr('number') targetedSkillsCount;
  @attr('number') validatedSkillsCount;
  @belongsTo('campaignAssessmentParticipationResult') campaignAssessmentParticipationResult;

  get totalSkillsCountPercentage() {
    return Math.round(this.targetedSkillsCount * 100 / this.campaignAssessmentParticipationResult.get('maxTotalSkillsCount'));
  }

  get validatedSkillsCountPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.targetedSkillsCount);
  }
}
