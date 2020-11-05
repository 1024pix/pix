const { UserNotAuthorizedToAccessEntity, AssessmentNotCompletedError, CampaignAlreadyArchivedError } = require('../errors');
const CampaignParticipationResultsShared = require('../events/CampaignParticipationResultsShared');

module.exports = async function shareCampaignResult({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  campaignRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }

  const campaign = await campaignRepository.get(campaignParticipation.campaignId);
  if (campaign.isArchived()) {
    throw new CampaignAlreadyArchivedError();
  }

  if (campaign.isAssessment()) {
    const isLatestAssessmentCompleted = await campaignParticipationRepository.isAssessmentCompleted(campaignParticipationId);
    if (!isLatestAssessmentCompleted) {
      throw new AssessmentNotCompletedError();
    }
  }

  await campaignParticipationRepository.share(campaignParticipation);

  return new CampaignParticipationResultsShared({
    campaignId: campaign.id,
    isAssessment: campaign.isAssessment(),
    campaignParticipationId: campaignParticipation.id,
    userId,
    organizationId: campaign.organizationId,
  });
};
