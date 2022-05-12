const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const buildCampaign = require('./build-campaign');
const { SHARED } = CampaignParticipationStatuses;

module.exports = function buildCampaignParticipation({
  id = 1,
  campaign = buildCampaign(),
  sharedAt = new Date('2020-02-01'),
  createdAt = new Date('2020-01-01'),
  deletedAt = null,
  participantExternalId = 'Mon mail pro',
  assessments = [],
  userId = 123,
  status = SHARED,
  validatedSkillsCount,
  schoolingRegistrationId = null,
  deletedBy = null,
} = {}) {
  const isShared = status === SHARED;
  return new CampaignParticipation({
    id,
    campaign,
    status,
    sharedAt: isShared ? sharedAt : null,
    createdAt,
    deletedAt,
    participantExternalId,
    assessments,
    userId,
    validatedSkillsCount,
    schoolingRegistrationId,
    deletedBy,
  });
};
