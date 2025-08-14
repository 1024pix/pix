import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import { SwapCampaignMismatchOrganizationError } from '../errors.js';

const swapCampaignCodes = async function ({
  firstCampaignId,
  secondCampaignId,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
} = {}) {
  const isFromSameOrganization = await campaignAdministrationRepository.isFromSameOrganization({
    firstCampaignId,
    secondCampaignId,
  });

  if (!isFromSameOrganization) {
    throw new SwapCampaignMismatchOrganizationError();
  }

  return campaignAdministrationRepository.swapCampaignCodes({ firstCampaignId, secondCampaignId });
};

export { swapCampaignCodes };
