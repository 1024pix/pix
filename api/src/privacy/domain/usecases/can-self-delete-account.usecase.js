import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import * as injectedCampaignParticipationsApiRepository from '../../infrastructure/repositories/campaign-participations-api.repository.js';
import * as injectedCandidatesApiRepository from '../../infrastructure/repositories/candidates-api.repository.js';
import * as injectedLearnersApiRepository from '../../infrastructure/repositories/learners-api.repository.js';
import * as injectedUserTeamsApiRepository from '../../infrastructure/repositories/user-teams-api.repository.js';

/**
 * Determines if a user can self-delete their account.
 *
 * @param {Object} params - The parameters for the use case.
 * @param {number} params.userId - The ID of the user.
 * @param {Object} params.featureToggles - The feature toggles configuration.
 * @param {Object} params.campaignParticipationsApiRepository - The repository for campaign participations operations.
 * @param {Object} params.candidatesApiRepository - The repository for candidate-related operations.
 * @param {Object} params.learnersApiRepository - The repository for learner-related operations.
 * @param {Object} params.userTeamsApiRepository - The repository for user team access operations.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if self-account deletion is enabled.
 */
const canSelfDeleteAccount = async ({
  userId,
  candidatesApiRepository = injectedCandidatesApiRepository,
  learnersApiRepository = injectedLearnersApiRepository,
  userTeamsApiRepository = injectedUserTeamsApiRepository,
  campaignParticipationsApiRepository = injectedCampaignParticipationsApiRepository,
} = {}) => {
  const isSelfAccountDeletionEnabled = await featureToggles.get('isSelfAccountDeletionEnabled');
  if (!isSelfAccountDeletionEnabled) return false;

  const hasBeenLearner = await learnersApiRepository.hasBeenLearner({ userId });
  if (hasBeenLearner) return false;

  const hasCampaignParticipations = await campaignParticipationsApiRepository.hasCampaignParticipations({ userId });
  if (hasCampaignParticipations) return false;

  const hasBeenCandidate = await candidatesApiRepository.hasBeenCandidate({ userId });
  if (hasBeenCandidate) return false;

  const userTeamsInfo = await userTeamsApiRepository.getUserTeamsInfo({ userId });
  if (userTeamsInfo.isPixAgent) return false;
  if (userTeamsInfo.isOrganizationMember) return false;
  if (userTeamsInfo.isCertificationCenterMember) return false;

  return true;
};

export { canSelfDeleteAccount };
