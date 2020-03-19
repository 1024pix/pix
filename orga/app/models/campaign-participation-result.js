import { computed } from '@ember/object';
import { max, mapBy } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default class CompetenceParticipationResult extends Model {

  @attr('number')
  totalSkillsCount;

  @attr('number')
  testedSkillsCount;

  @attr('number')
  validatedSkillsCount;

  @attr('number')
  isCompleted;

  @hasMany('competenceResult')
  competenceResults;

  @mapBy('competenceResults', 'totalSkillsCount')
  totalSkillsCounts;

  @max('totalSkillsCounts')
  maxTotalSkillsCountInCompetences;

  @computed('totalSkillsCount', 'testedSkillsCount', 'isCompleted')
  get percentageProgression() {
    if (this.isCompleted) {
      return 100;
    }

    return Math.round(this.testedSkillsCount * 100 / this.totalSkillsCount);
  }

  @computed('totalSkillsCount', 'validatedSkillsCount')
  get masteryPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }
}
