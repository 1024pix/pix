const UserWithActivity = require('../read-models/UserWithActivity');

module.exports = async function getCurrentUser({
  authenticatedUserId,
  userRepository,
  campaignParticipationRepository,
}) {
  const [hasAssessmentParticipations, codeForLastProfileToShare] = await Promise.all([
    campaignParticipationRepository.hasAssessmentParticipations(authenticatedUserId),
    campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(authenticatedUserId),
  ]);
  const user = await userRepository.get(authenticatedUserId);
  return new UserWithActivity({
    user,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
  });
};
