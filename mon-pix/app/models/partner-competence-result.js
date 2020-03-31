import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class PartnerCompetenceResult extends Model {

  // attributes
  @attr('string') areaColor;
  @attr('string') name;
  @attr('number') masteryPercentage;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;

  // includes
  @belongsTo('campaignParticipationResult') campaignParticipationResult;

  @computed('totalSkillsCount', 'campaignParticipationResult')
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationResult.get('maxTotalSkillsCountInPartnerCompetences'));
  }
}
