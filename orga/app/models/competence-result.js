import { computed } from '@ember/object';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class CompetenceResult extends Model {
  @attr('string')
  name;

  @attr('string')
  index;

  @attr('string')
  areaColor;

  @attr('number')
  totalSkillsCount;

  @attr('number')
  testedSkillsCount;

  @attr('number')
  validatedSkillsCount;

  @belongsTo('campaignParticipationResult')
  campaignParticipationResult;

  @computed(
    'totalSkillsCount',
    'campaignParticipationResult.maxTotalSkillsCountInCompetences'
  )
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationResult.get('maxTotalSkillsCountInCompetences'));
  }

  @computed('validatedSkillsCount', 'totalSkillsCount')
  get validatedSkillsPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }
}
