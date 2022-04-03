const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const ParticipationForCampaignManagement = require('../../../../lib/domain/models/ParticipationForCampaignManagement');

module.exports = function buildParticipationForCampaignManagement({
  id = 1,
  lastName = 'Un nom',
  firstName = 'Un prénom',
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
