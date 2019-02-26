const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function findCampaignParticipations({
  userId,
  options,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository
}) {
  if (options.filter.assessmentId) {
    return smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(options.filter.assessmentId, userId)
      .then((assessmentBelongToUser) => {
        if(assessmentBelongToUser) {
          return campaignParticipationRepository.find(options);
        }
        return Promise.reject(new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation'));
      });
  }

  return campaignParticipationRepository.find(options);
};
