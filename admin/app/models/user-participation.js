import Model, { attr } from '@ember-data/model';

export const campaignParticipationStatuses = {
  STARTED: 'En cours',
  TO_SHARE: 'En attente d’envoi',
  SHARED: 'Envoyé',
};

export default class UserParticipation extends Model {
  @attr campaignId;
  @attr('string') campaignCode;
  @attr('string') participantExternalId;
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('date') deletedAt;
  @attr deletedBy;
  @attr('string') deletedByFullName;
  @attr('string') organizationLearnerFullName;

  get displayedStatus() {
    return campaignParticipationStatuses[this.status];
  }
}
