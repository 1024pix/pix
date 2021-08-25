const { UserNotAuthorizedToAccessEntityError, NoStagesForCampaign } = require('../errors');

module.exports = async function getCampaignParticipationsCountByStage({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationRepository,
  targetProfileWithLearningContentRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });
  if (!targetProfile.hasReachableStages()) {
    throw new NoStagesForCampaign();
  }

  const stagesBoundaries = targetProfile.getStageThresholdBoundaries();
  const data = await campaignParticipationRepository.countParticipationsByStage(campaignId, stagesBoundaries);

  return targetProfile.stages.map((stage) => ({
    id: stage.id,
    value: data[stage.id] || 0,
    title: stage.prescriberTitle,
    description: stage.prescriberDescription,
  }));
};
