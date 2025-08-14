import * as injectedUserRecommendedTrainingRepository from '../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { anonymousUserTokenRepository as injectedAnonymousUserTokenRepository } from '../../infrastructure/repositories/anonymous-user-token.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { UserWithActivity } from '../read-models/UserWithActivity.js';

/**
 * @param {{
 *   authenticatedUserId: string,
 *   userRepository: userRepository,
 *   campaignParticipationRepository: CampaignParticipationRepository,
 *   userRecommendedTrainingRepository: UserRecommendedTrainingRepository,
 * }} params
 * @return {Promise<UserWithActivity>}
 */
export const getCurrentUser = withTransaction(async function ({
  authenticatedUserId,
  userRepository = injectedUserRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  userRecommendedTrainingRepository = injectedUserRecommendedTrainingRepository,
  anonymousUserTokenRepository = injectedAnonymousUserTokenRepository,
} = {}) {
  const [hasAssessmentParticipations, codeForLastProfileToShare, hasRecommendedTrainings] = await Promise.all([
    campaignParticipationRepository.hasAssessmentParticipations(authenticatedUserId),
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(authenticatedUserId),
    userRecommendedTrainingRepository.hasRecommendedTrainings({ userId: authenticatedUserId }),
  ]);

  const user = await userRepository.get(authenticatedUserId);
  const shouldSeeDataProtectionPolicyInformationBanner = user.shouldSeeDataProtectionPolicyInformationBanner;

  let anonymousUserToken;
  if (user.isAnonymous) {
    anonymousUserToken = await anonymousUserTokenRepository.find(authenticatedUserId);
  }

  return new UserWithActivity({
    user,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
    hasRecommendedTrainings,
    shouldSeeDataProtectionPolicyInformationBanner,
    anonymousUserToken,
  });
});
