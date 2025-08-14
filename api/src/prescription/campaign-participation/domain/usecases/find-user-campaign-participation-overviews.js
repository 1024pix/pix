import * as injectedCompareStagesAndAcquiredStages from '../../../../evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import * as injectedStageAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as injectedStageRepository from '../../../../evaluation/infrastructure/repositories/stage-repository.js';
import * as injectedCampaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository.js';
const findUserCampaignParticipationOverviews = async function ({
  userId,
  states,
  page,
  stageRepository = injectedStageRepository,
  stageAcquisitionRepository = injectedStageAcquisitionRepository,
  campaignParticipationOverviewRepository = injectedCampaignParticipationOverviewRepository,
  compareStagesAndAcquiredStages = injectedCompareStagesAndAcquiredStages,
} = {}) {
  const concatenatedStates = states ? [].concat(states) : undefined;

  const { campaignParticipationOverviews, pagination } =
    await campaignParticipationOverviewRepository.findByUserIdWithFilters({
      userId,
      states: concatenatedStates,
      page,
    });

  // We deduplicate targetProfileIds in the case where several campaigns belong to the same target profile
  const targetProfileIds = [...new Set(campaignParticipationOverviews.map(({ targetProfileId }) => targetProfileId))];
  const campaignParticipationIds = campaignParticipationOverviews.map(({ id }) => id);

  const [stages, acquiredStages] = await Promise.all([
    stageRepository.getByTargetProfileIds(targetProfileIds),
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
      const stagesComparison = compareStagesAndAcquiredStages.compare(
        stagesForThisCampaign,
        acquiredStagesForThisCampaign,
      );

      campaignParticipationOverview.totalStagesCount = stagesComparison.totalNumberOfStages;
      campaignParticipationOverview.validatedStagesCount = stagesComparison.reachedStageNumber;

      return campaignParticipationOverview;
    },
  );

  return { campaignParticipationOverviews: campaignParticipationOverviewsWithStages, pagination };
};

export { findUserCampaignParticipationOverviews };
