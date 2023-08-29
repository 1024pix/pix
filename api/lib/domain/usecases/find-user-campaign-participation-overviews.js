import * as defaultStageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as defaultStageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as defaultStageAndStageAcquisitionComparisonService from '../services/stages/stage-and-stage-acquisition-comparison-service.js';

const findUserCampaignParticipationOverviews = async function ({
  userId,
  states,
  page,
  campaignParticipationOverviewRepository,
  stageAndStageAcquisitionComparisonService = defaultStageAndStageAcquisitionComparisonService,
  stageRepository = defaultStageRepository,
  stageAcquisitionRepository = defaultStageAcquisitionRepository,
}) {
  const concatenatedStates = states ? [].concat(states) : undefined;

  const { campaignParticipationOverviews, pagination } =
    await campaignParticipationOverviewRepository.findByUserIdWithFilters({
      userId,
      states: concatenatedStates,
      page,
    });

  const campaignIds = campaignParticipationOverviews.map(({ campaignId }) => campaignId);
  const campaignParticipationIds = campaignParticipationOverviews.map(({ id }) => id);

  const [stages, acquiredStages] = await Promise.all([
    stageRepository.getByCampaignIds(campaignIds),
    stageAcquisitionRepository.getByCampaignParticipations(campaignParticipationIds),
  ]);

  const campaignParticipationOverviewsWithStages = campaignParticipationOverviews.map(
    (campaignParticipationOverview) => {
      const stagesForThisCampaign = stages.filter(
        ({ targetProfileId }) => targetProfileId === campaignParticipationOverview.targetProfileId,
      );
      const acquiredStagesForThisCampaign = acquiredStages.filter(
        ({ campaignParticipationId }) => campaignParticipationId === campaignParticipationOverview.id,
      );
      const stagesComparison = stageAndStageAcquisitionComparisonService.compare(
        stagesForThisCampaign,
        acquiredStagesForThisCampaign,
      );

      campaignParticipationOverview.totalStagesCount = stagesComparison.highestReachedStageNumber;
      campaignParticipationOverview.validatedStagesCount = stagesComparison.totalNumberOfStages;

      return campaignParticipationOverview;
    },
  );

  return { campaignParticipationOverviews: campaignParticipationOverviewsWithStages, pagination };
};

export { findUserCampaignParticipationOverviews };
