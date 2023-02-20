import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';
import CampaignParticipationForUserManagement from '../../../../lib/domain/read-models/CampaignParticipationForUserManagement';

export default function buildCampaignParticipationForUserManagement({
  id = 1,
  participantExternalId = 'un identifiant externe',
  status = CampaignParticipationStatuses.TO_SHARE,
  campaignId = 2,
  campaignCode = 'SOMECODE0',
  createdAt = new Date(),
  sharedAt = null,
  deletedAt = null,
  deletedBy = null,
  deletedByFirstName = null,
  deletedByLastName = null,
  organizationLearnerFirstName = null,
  organizationLearnerLastName = null,
} = {}) {
  return new CampaignParticipationForUserManagement({
    id,
    campaignId,
    campaignCode,
    participantExternalId,
    status,
    createdAt,
    sharedAt,
    deletedAt,
    deletedBy,
    deletedByFirstName,
    deletedByLastName,
    organizationLearnerFirstName,
    organizationLearnerLastName,
  });
}
