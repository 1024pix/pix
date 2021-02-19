import Model, { attr } from '@ember-data/model';

export default class CampaignParticipationOverviews extends Model {

  // attributes
  @attr('date') createdAt;
  @attr('boolean') isShared;
  @attr('date') sharedAt;
  @attr('string') organizationName;
  @attr('string') assessmentState;
  @attr('string') campaignCode;
  @attr('string') campaignTitle;
  @attr('date') campaignArchivedAt;
  @attr('number') masteryPercentage;
  @attr('number') totalStagesCount;
  @attr('number') validatedStagesCount;

  get status() {
    if (this.campaignArchivedAt) return 'ARCHIVED';
    else if (this.isShared) return 'ENDED';
    else if (this.assessmentState === 'completed') return 'TO_SHARE';
    else return 'ONGOING';
  }
}
