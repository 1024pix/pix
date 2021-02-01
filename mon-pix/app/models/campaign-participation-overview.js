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
  @attr('number') masteryPercentage;

  get status() {
    if (this.isShared) return 'finished';

    return this.assessmentState;
  }

  get date() {
    if (this.status === 'finished') return this.sharedAt;

    return this.createdAt;
  }
}
