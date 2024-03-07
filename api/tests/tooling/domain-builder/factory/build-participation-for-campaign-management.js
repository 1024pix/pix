import { ParticipationForCampaignManagement } from '../../../../lib/domain/models/ParticipationForCampaignManagement.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';

const buildParticipationForCampaignManagement = function ({
  id = 1,
  lastName = 'Un nom',
  firstName = 'Un prénom',
  userId = 2,
  userLastName = 'nom du user',
  userFirstName = 'prénom du user',
  participantExternalId = 'un identifiant externe',
  status = CampaignParticipationStatuses.TO_SHARE,
  createdAt = new Date(),
  sharedAt = null,
  deletedAt = null,
  deletedBy = null,
  deletedByFirstName = null,
  deletedByLastName = null,
} = {}) {
  return new ParticipationForCampaignManagement({
    id,
    lastName,
    firstName,
    userId,
    userLastName,
    userFirstName,
    participantExternalId,
    status,
    createdAt,
    sharedAt,
    deletedAt,
    deletedBy,
    deletedByFirstName,
    deletedByLastName,
  });
};

export { buildParticipationForCampaignManagement };
