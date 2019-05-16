const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function ShareCampaignResult({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  if (!(await smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(campaignParticipation.assessmentId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }
  return campaignParticipationRepository.updateCampaignParticipation(campaignParticipation);
};
