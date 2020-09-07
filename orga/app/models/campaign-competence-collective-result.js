import Model, { belongsTo, attr } from '@ember-data/model';

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

  get roundedAverageValidatedSkills() {
    return Math.round(this.averageValidatedSkills * 10) / 10;
  }

  get validatedSkillsPercentage() {
    return Math.round(this.averageValidatedSkills * 100 / this.targetedSkillsCount);
  }

  get totalSkillsCountPercentage() {
    return Math.round(this.targetedSkillsCount * 100 / this.campaignCollectiveResult.get('maxTotalSkillsCountInCompetences'));
  }
}
