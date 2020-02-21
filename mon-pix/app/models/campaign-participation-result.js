import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { mapBy, max } from '@ember/object/computed';
import { computed } from '@ember/object';

export default class CampaignParticipationResult extends Model {

  // attributes
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;

  // includes
  @belongsTo('badge') badge;
  @hasMany('competenceResult') competenceResults;

  // methods
  @mapBy('competenceResults', 'totalSkillsCount') totalSkillsCounts;

  @max('totalSkillsCounts') maxTotalSkillsCountInCompetences;

  @computed('totalSkillsCount', 'validatedSkillsCount')
  get masteryPercentage() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }
}
