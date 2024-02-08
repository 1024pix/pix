import Model, { attr } from '@ember-data/model';

export default class CampaignParticipationOverviews extends Model {
  // attributes
  @attr('date') createdAt;
  @attr('boolean') isShared;
  @attr('date') sharedAt;
  @attr('string') organizationName;
  @attr('string') status;
  @attr('string') campaignCode;
  @attr('string') campaignTitle;
  @attr('boolean') isAutonomousCourse;
  @attr('date') disabledAt;
  @attr('number') masteryRate;
  @attr('number') totalStagesCount;
  @attr('number') validatedStagesCount;

  get cardStatus() {
    if (this.isShared) return 'ENDED';
    else if (this.disabledAt) return 'DISABLED';
    else if (this.status === 'TO_SHARE') return 'TO_SHARE';
    else return 'ONGOING';
  }
}
