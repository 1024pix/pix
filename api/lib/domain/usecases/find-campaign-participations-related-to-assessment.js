const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignParticipationsRelatedToAssessment({
  userId,
  assessmentId,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository
}) {
  if (!(await smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(assessmentId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }
  return campaignParticipationRepository.findByAssessmentId(assessmentId);
};
