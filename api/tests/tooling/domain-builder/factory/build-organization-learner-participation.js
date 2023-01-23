const OrganizationLearnerParticipation = require('../../../../lib/domain/read-models/OrganizationLearnerParticipation');
const CampaignTypes = require('../../../../lib/domain/models/CampaignTypes');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

module.exports = function buildOrganizationLearnerParticipation({
  id = '123',
  campaignType = CampaignTypes.ASSESSMENT,
  campaignName = 'Ma campagne',
  createdAt = new Date('2020-01-01'),
  sharedAt = new Date('2020-02-01'),
  status = CampaignParticipationStatuses.TO_SHARE,
} = {}) {
  return new OrganizationLearnerParticipation({
    id,
    campaignType,
    campaignName,
    createdAt,
    sharedAt,
    status,
  });
};
