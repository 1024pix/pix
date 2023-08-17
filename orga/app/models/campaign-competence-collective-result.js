import Model, { attr, belongsTo } from '@ember-data/model';

export default class CampaignCompetenceCollectiveResult extends Model {
  @attr('string')
  areaCode;

  @attr('string')
  areaColor;

  @attr('string')
  competenceName;

  @attr('string')
  competenceId;

  @attr('number')
  averageValidatedSkills;

  @attr('number')
  targetedSkillsCount;

  @belongsTo('campaign-collective-result')
  campaignCollectiveResult;

  get validatedSkillsPercentage() {
    return Math.round((this.averageValidatedSkills * 100) / this.targetedSkillsCount);
  }
}
