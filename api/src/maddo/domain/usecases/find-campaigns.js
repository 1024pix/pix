import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
export async function findCampaigns({
  organizationId,
  campaignRepository = injectedCampaignRepository,
  page,
  locale,
} = {}) {
  return campaignRepository.findByOrganizationId(organizationId, page, locale);
}
