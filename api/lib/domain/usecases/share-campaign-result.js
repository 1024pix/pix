const { AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntity, AssessmentNotCompletedError, ArchivedCampaignError } = require('../errors');
const CampaignParticipationResultsShared = require('../events/CampaignParticipationResultsShared');

module.exports = async function shareCampaignResult({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  campaignAssessmentInfoRepository,
  campaignRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }

  const campaign = await campaignRepository.get(campaignParticipation.campaignId);
  if (campaign.isArchived()) {
    throw new ArchivedCampaignError('Cannot share results on an archived campaign.');
  }

  if (campaign.isAssessment()) {
    const campaignAssessmentInfo = await campaignAssessmentInfoRepository.getByCampaignParticipationId(campaignParticipationId);
    if (campaignAssessmentInfo.isShared) {
      throw new AlreadySharedCampaignParticipationError();
    }
    if (!campaignAssessmentInfo.isCompleted) {
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
