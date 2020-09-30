import DS from 'ember-data';
const { Model, attr } = DS;

export const statuses = {
  SHARED: 'shared',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

export default class CampaignAssessmentParticipationSummary extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() participantExternalId;
  @attr() status;
  @attr() masteryPercentage;

  get isShared() {
    return this.status === statuses.SHARED;
  }
  get isOngoing() {
    return this.status === statuses.ONGOING;
  }
  get isCompleted() {
    return this.status === statuses.COMPLETED;
  }
}
