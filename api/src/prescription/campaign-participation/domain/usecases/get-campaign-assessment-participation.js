import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

const getCampaignAssessmentParticipation = async function ({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository,
  campaignAssessmentParticipationRepository,
  badgeAcquisitionRepository,
  stageCollectionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const campaignAssessmentParticipation =
    await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
      campaignId,
      campaignParticipationId,
    });

  const acquiredBadgesByCampaignParticipations =
    await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
      campaignParticipationsIds: [campaignParticipationId],
    });
  const badges = acquiredBadgesByCampaignParticipations[campaignAssessmentParticipation.campaignParticipationId];
  campaignAssessmentParticipation.setBadges(badges);

  const stageCollection = await stageCollectionRepository.findStageCollection({ campaignId });
  const reachedStage = stageCollection.getReachedStage(
    campaignAssessmentParticipation.validatedSkillsCount,
    campaignAssessmentParticipation.masteryRate * 100,
  );
  campaignAssessmentParticipation.setStageInfo(reachedStage);

  return campaignAssessmentParticipation;
};

export { getCampaignAssessmentParticipation };
