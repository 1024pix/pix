const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function findCampaignParticipationsByAssessmentId({
  userId,
  assessmentId,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository
}) {
  return smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(assessmentId, userId)
    .then((assessmentBelongToUser) => {
      if(assessmentBelongToUser) {
        return campaignParticipationRepository.findByAssessmentId(assessmentId);
      }
      return Promise.reject(new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation'));
    });

};
