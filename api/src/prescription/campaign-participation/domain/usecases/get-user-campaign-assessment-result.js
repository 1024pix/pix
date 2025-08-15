import * as injectedCompareStagesAndAcquiredStages from '../../../../evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import * as injectedBadgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as injectedStageAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as injectedStageRepository from '../../../../evaluation/infrastructure/repositories/stage-repository.js';
import { NoCampaignParticipationForUserAndCampaign, NotFoundError } from '../../../../shared/domain/errors.js';
import * as injectedBadgeForCalculationRepository from '../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import { repositories as injectedRepositories } from '../../../../shared/infrastructure/repositories/index.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as injectedParticipantResultRepository from '../../infrastructure/repositories/participant-result-repository.js';

const getUserCampaignAssessmentResult = async function ({
  userId,
  campaignId,
  locale,
  badgeRepository = injectedBadgeRepository,
  knowledgeElementRepository = injectedRepositories.knowledgeElementRepository,
  badgeForCalculationRepository = injectedBadgeForCalculationRepository,
  participantResultRepository = injectedParticipantResultRepository,
  stageRepository = injectedStageRepository,
  stageAcquisitionRepository = injectedStageAcquisitionRepository,
  compareStagesAndAcquiredStages = injectedCompareStagesAndAcquiredStages,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  const { SHARED, TO_SHARE } = CampaignParticipationStatuses;
  const campaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({
    campaignId,
    userId,
  });

  if (![TO_SHARE, SHARED].includes(campaignParticipation.status)) {
    throw new NoCampaignParticipationForUserAndCampaign();
  }
  try {
    const [badges, knowledgeElements] = await Promise.all([
      badgeRepository.findByCampaignId(campaignId),
      knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
        userId,
        campaignParticipationId: campaignParticipation.id,
      }),
    ]);
    const stillValidBadgeIds = await _checkStillValidBadges(
      campaignId,
      knowledgeElements,
      badgeForCalculationRepository,
    );
    const badgeWithAcquisitionPercentage = await _getBadgeAcquisitionPercentage(
      campaignId,
      knowledgeElements,
      badgeForCalculationRepository,
    );

    const badgesWithValidity = badges.map((badge) => ({
      ...badge,
      isValid: stillValidBadgeIds.includes(badge.id),
      acquisitionPercentage: badgeWithAcquisitionPercentage.find(
        (badgeForCalculation) => badgeForCalculation.id === badge.id,
      ).acquisitionPercentage,
    }));

    const [stages, acquiredStages] = await Promise.all([
      stageRepository.getByCampaignId(campaignId),
      stageAcquisitionRepository.getByCampaignParticipation(campaignParticipation.id),
    ]);

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

async function _checkStillValidBadges(campaignId, knowledgeElements, badgeForCalculationRepository) {
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badgesForCalculation.filter((badge) => badge.shouldBeObtained(knowledgeElements)).map(({ id }) => id);
}

async function _getBadgeAcquisitionPercentage(campaignId, knowledgeElements, badgeForCalculationRepository) {
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badgesForCalculation.map((badge) => ({
    id: badge.id,
    acquisitionPercentage: badge.getAcquisitionPercentage(knowledgeElements),
  }));
}
