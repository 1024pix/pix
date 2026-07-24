import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class CampaignParticipationResult extends Model {
  // attributes
  @attr('number') masteryRate;
  @attr('number') totalSkillsCount;
  @attr('number') testedSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('boolean') canRetry;
  @attr('number') remainingSecondsBeforeRetrying;
  @attr('boolean') canReset;
  @attr('boolean') isDisabled;
  @attr('boolean') isShared;
  @attr('string') participantExternalId;
  @attr('date') sharedAt;

  // includes
  @hasMany('campaign-participation-badge', {
    async: false,
    inverse: 'campaignParticipationResult',
  })
  campaignParticipationBadges;

  @hasMany('competence-result', { async: false, inverse: 'campaignParticipationResult' }) competenceResults;

  @belongsTo('reached-stage', { async: false, inverse: 'campaignParticipationResult' }) reachedStage;

  get acquiredBadges() {
    return this.campaignParticipationBadges.filter((badge) => badge.isAcquired);
  }

  get hasReachedStage() {
    return this.reachedStage !== null;
  }
}
