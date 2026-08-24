import { UserWithActivity } from '../models/UserWithActivity.js';

/**
 * @param {object} params
 * @param {string} params.authenticatedUserId
 * @return {Promise<UserWithActivity>}
 */
export const getCurrentUser = async function ({
  authenticatedUserId,
  userRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
  legalDocumentApiRepository,
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
  const tosStatus = await legalDocumentApiRepository.getPixAppTosStatus({ userId: authenticatedUserId });

  return new UserWithActivity({
    user,
    tosStatus,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
    hasRecommendedTrainings,
  });
};
