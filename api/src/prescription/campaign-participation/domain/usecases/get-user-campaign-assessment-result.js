import { NoCampaignParticipationForUserAndCampaign, NotFoundError } from '../../../../shared/domain/errors.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

const getUserCampaignAssessmentResult = async function ({
  userId,
  campaignId,
  locale,
  badgeRepository,
  knowledgeElementForParticipationService,
  badgeForCalculationRepository,
  participantResultRepository,
  stageRepository,
  stageAcquisitionRepository,
  compareStagesAndAcquiredStages,
  campaignParticipationRepository,
}) {
  const { SHARED } = CampaignParticipationStatuses;
  const campaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({
    campaignId,
    userId,
  });

  if (campaignParticipation.status !== SHARED) {
    throw new NoCampaignParticipationForUserAndCampaign();
  }
  try {
    const badges = await badgeRepository.findByCampaignId(campaignId);
    const knowledgeElements = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
      userId,
      campaignParticipationId: campaignParticipation.id,
    });

    const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
    const stillValidBadgeIds = badgesForCalculation
      .filter((badge) => badge.shouldBeObtained(knowledgeElements))
      .map(({ id }) => id);

    const badgeWithAcquisitionPercentage = badgesForCalculation.map((badge) => ({
      id: badge.id,
      acquisitionPercentage: badge.getAcquisitionPercentage(knowledgeElements),
    }));

    const badgesWithValidity = badges.map((badge) => ({
      ...badge,
      isValid: stillValidBadgeIds.includes(badge.id),
      acquisitionPercentage:
        badgeWithAcquisitionPercentage.find((badgeForCalculation) => badgeForCalculation.id === badge.id)
          ?.acquisitionPercentage ?? null,
    }));

    const stages = await stageRepository.getByCampaignId(campaignId);
    const acquiredStages = await stageAcquisitionRepository.getByCampaignParticipation(campaignParticipation.id);

    const stagesAndAcquiredStagesComparison = compareStagesAndAcquiredStages.compare(stages, acquiredStages);

    return await participantResultRepository.get({
      userId,
      campaignId,
      locale,
      badges: badgesWithValidity,
      stages,
      reachedStage: {
        ...stagesAndAcquiredStagesComparison.reachedStage,
        totalStage: stagesAndAcquiredStagesComparison.totalNumberOfStages,
        reachedStage: stagesAndAcquiredStagesComparison.reachedStageNumber,
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) throw new NoCampaignParticipationForUserAndCampaign();
    throw error;
  }
};

export { getUserCampaignAssessmentResult };
// TODO PIX-21173 Create dedicated repository or service for badges to remove logic duplication for acquisition percentage
// TODO PIX-21173 part2 We can use badgeAcquisitionRepository to avoid unnecessary calculation
