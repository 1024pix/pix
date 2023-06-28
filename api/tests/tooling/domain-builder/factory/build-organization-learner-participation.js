import { OrganizationLearnerParticipation } from '../../../../lib/shared/domain/read-models/OrganizationLearnerParticipation.js';
import { CampaignTypes } from '../../../../lib/shared/domain/models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../../lib/shared/domain/models/CampaignParticipationStatuses.js';

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
