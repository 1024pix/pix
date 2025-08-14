import * as injectedCampaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository.js';
const findUserAnonymisedCampaignAssessments = async function ({
  userId,
  campaignAssessmentParticipationRepository = injectedCampaignAssessmentParticipationRepository,
} = {}) {
  return await campaignAssessmentParticipationRepository.getDetachedByUserId({ userId });
};
export { findUserAnonymisedCampaignAssessments };
