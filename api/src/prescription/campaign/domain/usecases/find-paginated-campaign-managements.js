import * as injectedCampaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository.js';
const findPaginatedCampaignManagements = function ({
  organizationId,
  page,
  campaignManagementRepository = injectedCampaignManagementRepository,
} = {}) {
  return campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });
};

export { findPaginatedCampaignManagements };
