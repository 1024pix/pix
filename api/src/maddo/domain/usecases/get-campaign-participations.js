import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
export async function getCampaignParticipations({
  campaignId,
  clientId,
  page,
  since,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  return campaignParticipationRepository.findByCampaignId(campaignId, clientId, page, since);
}
