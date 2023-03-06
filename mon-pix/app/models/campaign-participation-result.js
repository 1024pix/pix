import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignParticipationResult extends Model {
  // attributes
  @attr('number') masteryRate;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('boolean') canRetry;
  @attr('boolean') canImprove;
  @attr('boolean') isDisabled;
  @attr('boolean') isShared;
  @attr('string') participantExternalId;
  @attr('number') estimatedFlashLevel;
  @attr('number') flashPixScore;

  // includes
  @hasMany('campaignParticipationBadges') campaignParticipationBadges;
  @hasMany('competenceResult') competenceResults;
  @belongsTo('reachedStage') reachedStage;

  get cleaBadge() {
    const badgeCleaKey = 'PIX_EMPLOI_CLEA';
    return this.campaignParticipationBadges.find((badge) => badge.key === badgeCleaKey);
  }
}
