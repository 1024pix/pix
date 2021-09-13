const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const buildCampaign = require('./build-campaign');
const { SHARED, STARTED } = CampaignParticipation.statuses;

module.exports = function buildCampaignParticipation({
  id = 1,
  campaign = buildCampaign(),
  isShared = true,
  sharedAt = new Date('2020-02-01'),
  createdAt = new Date('2020-01-01'),
  participantExternalId = 'Mon mail pro',
  campaignId = campaign.id,
  assessmentId = null,
  userId = 123,
  status = STARTED,
  validatedSkillsCount,
} = {}) {

  return new CampaignParticipation({
    id,
    campaign,
    status: isShared ? SHARED : status,
    sharedAt,
    createdAt,
    participantExternalId,
    campaignId,
    assessmentId,
    userId,
    validatedSkillsCount,
  });
};
