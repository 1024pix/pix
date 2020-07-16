import DS from 'ember-data';
const { Model, attr, hasMany } = DS;
import { computed } from '@ember/object';
import { mapBy, max } from '@ember/object/computed';

export default class CampaignParticipationResult extends Model {

  @attr() totalSkillsCount;
  @attr() testedSkillsCount;
  @attr() validatedSkillsCount;
  @attr() isCompleted;
  @attr() progress;
  @hasMany('competenceResult') competenceResults;

  @mapBy('competenceResults', 'totalSkillsCount') totalSkillsCounts;
  @max('totalSkillsCounts') maxTotalSkillsCountInCompetences;

  @computed('totalSkillsCount', 'validatedSkillsCount')
  get masteryPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }
  @computed('progress', 'isCompleted')
  get percentageProgression() {
    if (this.isCompleted) {
      return 100;
    }

    return Math.round(this.progress * 100);
  }
}
