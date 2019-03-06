const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function getCampaignParticipations({
  userId,
  options,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository
}) {
  return smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(options.filter.assessmentId, userId)
    .then((assessmentBelongToUser) => {
      if(assessmentBelongToUser) {
        return campaignParticipationRepository.find(options);
      }
      throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
    });

};
