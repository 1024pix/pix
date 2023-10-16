const findUserCampaignParticipationOverviews = async function ({
  userId,
  states,
  page,
  stageRepository,
  stageAcquisitionRepository,
  campaignParticipationOverviewRepository,
  stageAndStageAcquisitionComparisonService,
}) {
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
      const stagesComparison = stageAndStageAcquisitionComparisonService.compare(
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
