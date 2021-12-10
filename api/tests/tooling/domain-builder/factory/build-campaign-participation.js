const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const buildCampaign = require('./build-campaign');
const { SHARED } = CampaignParticipation.statuses;

module.exports = function buildCampaignParticipation({
  id = 1,
  campaign = buildCampaign(),
  sharedAt = new Date('2020-02-01'),
  createdAt = new Date('2020-01-01'),
  participantExternalId = 'Mon mail pro',
  assessments = [],
  userId = 123,
  status = SHARED,
  validatedSkillsCount,
  schoolingRegistrationId = null,
} = {}) {
  const isShared = status === SHARED;
  return new CampaignParticipation({
    id,
    campaign,
    status,
    sharedAt: isShared ? sharedAt : null,
    createdAt,
    participantExternalId,
    assessments,
    userId,
    validatedSkillsCount,
    schoolingRegistrationId,
  });
};
