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
export const getCurrentUser = async function ({
  authenticatedUserId,
  userRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
}) {
  const hasAssessmentParticipations =
    await campaignParticipationRepository.hasAssessmentParticipations(authenticatedUserId);
  const codeForLastProfileToShare =
    await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(
      authenticatedUserId,
    );
  const hasRecommendedTrainings = await userRecommendedTrainingRepository.hasRecommendedTrainings({
    userId: authenticatedUserId,
  });

  const user = await userRepository.get(authenticatedUserId);
  const shouldSeeDataProtectionPolicyInformationBanner = user.shouldSeeDataProtectionPolicyInformationBanner;

  return new UserWithActivity({
    user,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
    hasRecommendedTrainings,
    shouldSeeDataProtectionPolicyInformationBanner,
  });
};
