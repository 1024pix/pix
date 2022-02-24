const ParticipationForCampaignManagement = require('../../../../lib/domain/models/ParticipationForCampaignManagement');

module.exports = function buildParticipationForCampaignManagement({
  id = 1,
  lastName = 'Un nom',
  firstName = 'Un prénom',
  participantExternalId = 'un identifiant externe',
  status = ParticipationForCampaignManagement.statuses.TO_SHARE,
  createdAt = new Date(),
  sharedAt = null,
} = {}) {
  return new ParticipationForCampaignManagement({
    id,
    lastName,
    firstName,
    participantExternalId,
    status,
    createdAt,
    sharedAt,
  });
};
