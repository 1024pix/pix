import Model, { belongsTo, attr } from '@ember-data/model';

export default class PartnerCompetenceResult extends Model {

  // attributes
  @attr('string') name;
  @attr('number') masteryPercentage;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;

  // includes
  @belongsTo('campaignParticipationBadge') campaignParticipationBadge;
}
