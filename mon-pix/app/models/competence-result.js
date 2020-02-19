import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class CompetenceResult extends Model {

  // attributes
  @attr('string') areaColor;
  @attr('string') name;
  @attr('string') index;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;

  // includes
  @belongsTo('campaignParticipationResult') campaignParticipationResult;

  @computed('totalSkillsCount', 'campaignParticipationResult')
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationResult.get('maxTotalSkillsCountInCompetences'));
  }

  @computed('validatedSkillsCount', 'totalSkillsCount')
  get validatedSkillsPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }
}
