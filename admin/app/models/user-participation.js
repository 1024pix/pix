import Model, { attr } from '@warp-drive/legacy/model';

export const campaignParticipationStatuses = {
  STARTED: 'En cours',
  SHARED: 'Envoyé',
};

export default class UserParticipation extends Model {
  @attr campaignId;
  @attr campaignParticipationId;
  @attr('string') campaignCode;
  @attr('string') participantExternalId;
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('date') deletedAt;
  @attr deletedBy;
  @attr('string') deletedByFullName;
  @attr('string') organizationLearnerFullName;
  @attr('boolean') isFromCombinedCourse;

  get displayedStatus() {
    return campaignParticipationStatuses[this.status];
  }
}
