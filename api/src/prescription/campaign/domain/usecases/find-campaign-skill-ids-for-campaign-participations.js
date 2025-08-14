import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
const findCampaignSkillIdsForCampaignParticipations = async function ({
  campaignParticipationIds,
  campaignRepository = injectedCampaignRepository,
} = {}) {
  return campaignRepository.findSkillIdsByCampaignParticipationIds({ campaignParticipationIds });
};

export { findCampaignSkillIdsForCampaignParticipations };
