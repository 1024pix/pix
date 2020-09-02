import DS from 'ember-data';
import { computed } from '@ember/object';
const { Model, attr, belongsTo } = DS;

export default class CampaignAssessmentParticipationCompetenceResult extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('string') areaColor;
  @attr('number') totalSkillsCount;
  @attr('number') validatedSkillsCount;
  @belongsTo('campaignAssessmentParticipationResult') campaignAssessmentParticipationResult;

  @computed(
    'totalSkillsCount',
    'campaignAssessmentParticipationResult.maxTotalSkillsCount'
  )
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignAssessmentParticipationResult.get('maxTotalSkillsCount'));
  }

  @computed('validatedSkillsCount', 'totalSkillsCount')
  get validatedSkillsCountPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }
}
