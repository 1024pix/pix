/* eslint ember/no-computed-properties-in-native-classes: 0 */
/* eslint ember/require-computed-property-dependencies: 0 */

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
  @belongsTo('campaignParticipationBadge') campaignParticipationBadge;

  @computed('totalSkillsCount', 'campaignParticipationResult')
  get totalSkillsCountPercentage() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationBadge.get('maxTotalSkillsCountInPartnerCompetences'));
  }
}
