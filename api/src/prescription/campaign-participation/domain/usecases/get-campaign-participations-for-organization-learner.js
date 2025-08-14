import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
const getCampaignParticipationsForOrganizationLearner = async function ({
  campaignId,
  organizationLearnerId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  const campaignParticipations = await campaignParticipationRepository.getCampaignParticipationsForOrganizationLearner({
    campaignId,
    organizationLearnerId,
  });
  return campaignParticipations;
};

export { getCampaignParticipationsForOrganizationLearner };
