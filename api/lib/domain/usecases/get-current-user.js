import { UserWithActivity } from '../read-models/UserWithActivity.js';

const getCurrentUser = async function ({
  authenticatedUserId,
  userRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
}) {
  const [hasAssessmentParticipations, codeForLastProfileToShare, hasRecommendedTrainings] = await Promise.all([
    campaignParticipationRepository.hasAssessmentParticipations(authenticatedUserId),
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(authenticatedUserId),
    userRecommendedTrainingRepository.hasRecommendedTrainings({ userId: authenticatedUserId }),
  ]);
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

export { getCurrentUser };
