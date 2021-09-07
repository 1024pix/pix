const Assessment = require('../models/Assessment');
const {
  AlreadySharedCampaignParticipationError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../domain/errors');

module.exports = async function beginCampaignParticipationImprovement({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignParticipationRepository,
  domainTransaction,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, {}, domainTransaction);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  if (campaignParticipation.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }

  campaignParticipation.improve();
  await campaignParticipationRepository.update(campaignParticipation, domainTransaction);

  const latestAssessment = await assessmentRepository.getLatestByCampaignParticipationId(campaignParticipation.id, domainTransaction);
  if (latestAssessment.isImproving && !latestAssessment.isCompleted()) {
    return null;
  }

  const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
  await assessmentRepository.save({ assessment, domainTransaction });
};
