const UserWithActivity = require('../read-models/UserWithActivity');

module.exports = async function getCurrentUser({
  authenticatedUserId,
  userRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
}) {
  const [hasAssessmentParticipations, codeForLastProfileToShare, hasRecommendedTrainings] = await Promise.all([
    campaignParticipationRepository.hasAssessmentParticipations(authenticatedUserId),
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(authenticatedUserId),
    userRecommendedTrainingRepository.hasRecommendedTrainings(authenticatedUserId),
  ]);
  const user = await userRepository.get(authenticatedUserId);
  return new UserWithActivity({
    user,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
    hasRecommendedTrainings,
  });
};
