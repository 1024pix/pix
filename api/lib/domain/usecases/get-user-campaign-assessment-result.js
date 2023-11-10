// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { NoCampaignParticipationForUserAndCampaign, NotFoundError } from '../errors.js';
import * as defaultCompareStageAndAcquiredStagesService from '../../../src/evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import * as defaultStageRepository from '../../../src/evaluation/infrastructure/repositories/stage-repository.js';
import * as defaultStageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as defaultParticipantResultRepository from '../../infrastructure/repositories/participant-result-repository.js';

const getUserCampaignAssessmentResult = async function ({
  userId,
  campaignId,
  locale,
  participantResultRepository = defaultParticipantResultRepository,
  badgeRepository,
  knowledgeElementRepository,
  badgeForCalculationRepository,
  stageRepository = defaultStageRepository,
  stageAcquisitionRepository = defaultStageAcquisitionRepository,
  compareStagesAndAcquiredStages = defaultCompareStageAndAcquiredStagesService,
}) {
  try {
    const [badges, knowledgeElements] = await Promise.all([
      badgeRepository.findByCampaignId(campaignId),
      knowledgeElementRepository.findUniqByUserId({ userId }),
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
      stageAcquisitionRepository.getByCampaignIdAndUserId(campaignId, userId),
    ]);

    const stagesAcquisitionService = compareStagesAndAcquiredStages.compare(stages, acquiredStages);

    return await participantResultRepository.getByUserIdAndCampaignId({
      userId,
      campaignId,
      locale,
      badges: badgesWithValidity,
      stages,
      reachedStage: {
        ...stagesAcquisitionService.reachedStage,
        totalStage: stagesAcquisitionService.totalNumberOfStages,
        reachedStage: stagesAcquisitionService.reachedStageNumber,
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
