import DS from 'ember-data';
import { computed } from '@ember/object';
const { belongsTo, Model, attr } = DS;

export default class CampaignTubeCollectiveResult extends Model {
  @attr('string')
  tubePracticalTitle;

  @attr('string')
  tubeId;

  @attr('number')
  averageValidatedSkills;

  @attr('number')
  totalSkillsCount;

  @belongsTo('campaign-collective-result')
  campaignCollectiveResult;

  @computed('averageValidatedSkills', 'totalSkillsCount')
  get validatedSkillsPercentage() {
    return Math.round(this.averageValidatedSkills * 100 / this.totalSkillsCount);
  }

  @computed(
    'totalSkillsCount',
    'campaignCollectiveResult.maxTotalSkillsCountInTubes'
  )
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignCollectiveResult.get('maxTotalSkillsCountInTubes'));
  }
}
