import { OrganizationLearnerParticipation } from '../../../../lib/domain/read-models/OrganizationLearnerParticipation.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';

const buildOrganizationLearnerParticipation = function ({
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

export { buildOrganizationLearnerParticipation };
