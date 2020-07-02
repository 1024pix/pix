/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, hasMany } from '@ember-data/model';
import { mapBy, max } from '@ember/object/computed';
import { computed } from '@ember/object';

export default class CampaignParticipationResult extends Model {

  // attributes
  @attr('number') masteryPercentage;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;

  // includes
  @hasMany('campaignParticipationBadges') campaignParticipationBadges;
  @hasMany('competenceResult') competenceResults;

  // methods
  @mapBy('competenceResults', 'totalSkillsCount') totalSkillsCounts;
  @max('totalSkillsCounts') maxTotalSkillsCountInCompetences;

  @computed('campaignParticipationBadges')
  get cleaBadge() {
    const badgeCleaKey = 'PIX_EMPLOI_CLEA';
    return this.campaignParticipationBadges.find((badge) => badge.key === badgeCleaKey);
  }
}
