const Assessment = require('../models/Assessment.js');
const {
  AlreadySharedCampaignParticipationError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../domain/errors.js');

module.exports = async function beginCampaignParticipationImprovement({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignParticipationRepository,
  domainTransaction,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  if (campaignParticipation.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }

  campaignParticipation.improve();
  await campaignParticipationRepository.update(campaignParticipation, domainTransaction);

  if (campaignParticipation.lastAssessment.isImproving && !campaignParticipation.lastAssessment.isCompleted()) {
    return null;
  }

  const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
  await assessmentRepository.save({ assessment, domainTransaction });
};
