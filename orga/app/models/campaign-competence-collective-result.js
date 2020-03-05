import { computed } from '@ember/object';
import DS from 'ember-data';
const { belongsTo, Model, attr } = DS;

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
  totalSkillsCount;

  @belongsTo('campaign-collective-result')
  campaignCollectiveResult;

  @computed('averageValidatedSkills')
  get roundedAverageValidatedSkills() {
    return Math.round(this.averageValidatedSkills * 10) / 10;
  }

  @computed('averageValidatedSkills', 'totalSkillsCount')
  get validatedSkillsPercentage() {
    return Math.round(this.averageValidatedSkills * 100 / this.totalSkillsCount);
  }

  @computed(
    'totalSkillsCount',
    'campaignCollectiveResult.maxTotalSkillsCountInCompetences'
  )
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignCollectiveResult.get('maxTotalSkillsCountInCompetences'));
  }
}
