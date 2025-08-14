import { NotFoundError } from '../../../../shared/application/http-errors.js';
import * as injectedCampaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository.js';

const getCampaignManagement = async function ({
  campaignId,
  campaignManagementRepository = injectedCampaignManagementRepository,
} = {}) {
  const campaign = await campaignManagementRepository.get(campaignId);
  if (!campaign) {
    throw new NotFoundError('campaign does not exist');
  }
  return campaign;
};

export { getCampaignManagement };
