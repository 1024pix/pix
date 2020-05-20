import DS from 'ember-data';
const { Model, attr } = DS;
import { equal } from '@ember/object/computed';

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

  @equal('status', statuses.SHARED) isShared;
  @equal('status', statuses.ONGOING) isOngoing;
  @equal('status', statuses.COMPLETED) isCompleted;
}
