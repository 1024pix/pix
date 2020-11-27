const Assessment = require('../models/Assessment');
const { AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function beginCampaignParticipationImprovement({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignParticipationRepository,
}) {

  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, {});
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  if (campaignParticipation.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }
  await _createImprovingAssessment({ userId, campaignParticipationId, assessmentRepository });
};

function _createImprovingAssessment({ userId, campaignParticipationId, assessmentRepository }) {
  const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
  return assessmentRepository.save({ assessment });
}
