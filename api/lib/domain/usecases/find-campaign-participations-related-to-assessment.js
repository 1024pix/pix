const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignParticipationsRelatedToAssessment({
  userId,
  assessmentId,
  assessmentRepository,
  campaignParticipationRepository,
}) {
  if (!(await assessmentRepository.ownedByUser({ id: assessmentId, userId }))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }
  return campaignParticipationRepository.findByAssessmentId(assessmentId);
};
