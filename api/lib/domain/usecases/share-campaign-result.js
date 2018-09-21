const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function ShareCampaignResult({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository,
}) {
  let campaignParticipation;
  return campaignParticipationRepository.get(campaignParticipationId)
    .then((campaignParticipationFound) => {
      campaignParticipation = campaignParticipationFound;
      return smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(campaignParticipation.assessmentId, userId);
    })
    .then((assessmentBelongToUser) => {
      if (assessmentBelongToUser) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation'));
    })
    .then(() => campaignParticipationRepository.updateCampaignParticipation(campaignParticipation));
};
