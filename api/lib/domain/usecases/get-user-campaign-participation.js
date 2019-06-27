const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipations({
  userId,
  options,
  campaignParticipationRepository,
  smartPlacementAssessmentRepository
}) {
  if (!(await smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(options.filter.assessmentId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }
  return campaignParticipationRepository.findByAssessmentId(options.filter.assessmentId);
};
