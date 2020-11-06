const Assessment = require('../models/Assessment');
const { AssessmentNotCompletedError, AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function beginCampaignParticipationImprovement({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignAssessmentInfoRepository,
}) {

  const campaignAssessmentInfo = await campaignAssessmentInfoRepository.getByCampaignParticipationId(campaignParticipationId);
  if (campaignAssessmentInfo.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  if (campaignAssessmentInfo.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }

  if (campaignAssessmentInfo.hasOngoingImprovment) {
    return {
      created: false,
    };
  }

  if (!campaignAssessmentInfo.isCompleted) {
    throw new AssessmentNotCompletedError();
  }

  await _createImprovingAssessment({ userId, campaignParticipationId, assessmentRepository });

  return {
    created: true,
  };
};

function _createImprovingAssessment({ userId, campaignParticipationId, assessmentRepository }) {
  const assessment = new Assessment({
    userId,
    campaignParticipationId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CAMPAIGN,
    courseId: Assessment.courseIdMessage.CAMPAIGN,
    isImproving: true,
  });
  return assessmentRepository.save({ assessment });
}
