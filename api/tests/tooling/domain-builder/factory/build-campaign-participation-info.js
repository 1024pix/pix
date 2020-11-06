const CampaignParticipationInfo = require('../../../../lib/domain/read-models/CampaignParticipationInfo');

function buildCampaignParticipationInfo({
  participantFirstName = 'participantFirstName',
  participantLastName = 'participantLastName',
  participantExternalId = 'participantExternalId',
  studentNumber = '123ABC',
  userId = 123,
  isCompleted = true,
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-02-02'),
  division,
} = {}) {
  return new CampaignParticipationInfo({
    participantFirstName,
    participantLastName,
    participantExternalId,
    studentNumber,
    userId,
    isCompleted,
    createdAt,
    sharedAt,
    division,
  });
}

module.exports = buildCampaignParticipationInfo;
