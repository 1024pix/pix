const Assessment = require('../models/Assessment');
const { AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function beginCampaignParticipationImprovement({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignParticipationRepository
}) {

  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, {});
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  if (campaignParticipation.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }
  await _createImprovingAssessment({ userId, campaignParticipationId, assessmentRepository });

  return campaignParticipation;
};

function _createImprovingAssessment({ userId, campaignParticipationId, assessmentRepository }) {
  const assessment = new Assessment({
    userId,
    campaignParticipationId,
    state: Assessment.states.STARTED,
    type: Assessment.types.SMARTPLACEMENT,
    courseId: Assessment.courseIdMessage.SMART_PLACEMENT,
    isImproving: true,
  });
  return assessmentRepository.save({ assessment });
}
