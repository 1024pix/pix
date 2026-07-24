import Model, { attr } from '@warp-drive/legacy/model';

export default class CampaignParticipationOverviews extends Model {
  // attributes
  @attr('date') createdAt;
  @attr('boolean') isShared;
  @attr('date') sharedAt;
  @attr('string') organizationName;
  @attr('string') status;
  @attr('string') campaignCode;
  @attr('string') campaignTitle;
  @attr('date') disabledAt;
  @attr('number') masteryRate;
  @attr('number') totalStagesCount;
  @attr('number') validatedStagesCount;
  @attr('boolean') canRetry;
  @attr('string') campaignType;

  get cardStatus() {
    if (this.isShared || this.status === 'COMPLETED') return 'ENDED';
    else if (this.disabledAt) return 'DISABLED';
    else return 'ONGOING';
  }
}
