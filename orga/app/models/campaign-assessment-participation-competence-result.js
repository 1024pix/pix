import DS from 'ember-data';
import { computed } from '@ember/object';
const { Model, attr, belongsTo } = DS;

export default class CampaignAssessmentParticipationCompetenceResult extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('string') areaColor;
  @attr('number') targetedSkillsCount;
  @attr('number') validatedSkillsCount;
  @belongsTo('campaignAssessmentParticipationResult') campaignAssessmentParticipationResult;

  @computed(
    'targetedSkillsCount',
    'campaignAssessmentParticipationResult.maxTotalSkillsCount',
  )
  get totalSkillsCountPercentage() {
    return Math.round(this.targetedSkillsCount * 100 / this.campaignAssessmentParticipationResult.get('maxTotalSkillsCount'));
  }

  @computed('validatedSkillsCount', 'targetedSkillsCount')
  get validatedSkillsCountPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.targetedSkillsCount);
  }
}
