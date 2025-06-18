import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
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
  userRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
  anonymousUserTokenRepository,
}) {
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
