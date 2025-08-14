import * as injectedParticipationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository.js';
const findPaginatedParticipationsForCampaignManagement = function ({
  campaignId,
  page,
  participationsForCampaignManagementRepository = injectedParticipationsForCampaignManagementRepository,
} = {}) {
  return participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
    campaignId,
    page,
  });
};

export { findPaginatedParticipationsForCampaignManagement };
