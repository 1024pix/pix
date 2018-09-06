const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function allowUserToShareHisCampaignResult({
  userId,
  assessmentId,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository,
}) {
  return smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(assessmentId, userId)
    .then((assessmentBelongToUser) => {
      if (assessmentBelongToUser) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation'));
    })
    .then(() => {
      return campaignParticipationRepository.findByAssessmentId(assessmentId);
    })
    .then(campaignParticipationRepository.updateCampaignParticipation);
};
