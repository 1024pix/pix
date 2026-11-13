const findUserCampaignParticipationOverviews = async function ({
  userId,
  states,
  stageRepository,
  stageAcquisitionRepository,
  campaignParticipationOverviewRepository,
  compareStagesAndAcquiredStages,
}) {
  const concatenatedStates = states ? [].concat(states) : undefined;

  const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
    userId,
    states: concatenatedStates,
  });
  // We deduplicate targetProfileIds in the case where several campaigns belong to the same target profile
  const targetProfileIds = [
    ...new Set(
      campaignParticipationOverviews
        .filter((participation) => participation.campaignType !== 'COMBINED_COURSE')
        .map(({ targetProfileId }) => targetProfileId),
    ),
  ];
  const campaignParticipationIds = campaignParticipationOverviews.map(({ id }) => id);

  const stages = await stageRepository.getByTargetProfileIds(targetProfileIds);
  const acquiredStages = await stageAcquisitionRepository.getByCampaignParticipations(campaignParticipationIds);

  const stagesByTargetProfileId = Map.groupBy(stages, ({ targetProfileId }) => targetProfileId);
  const acquiredStagesByCampaignParticipationId = Map.groupBy(
    acquiredStages,
    ({ campaignParticipationId }) => campaignParticipationId,
  );

  const campaignParticipationOverviewsWithStages = campaignParticipationOverviews.map(
    (campaignParticipationOverview) => {
      const stagesForThisCampaign = stagesByTargetProfileId.get(campaignParticipationOverview.targetProfileId) ?? [];
      const acquiredStagesForThisCampaign =
        acquiredStagesByCampaignParticipationId.get(campaignParticipationOverview.id) ?? [];
      const stagesComparison = compareStagesAndAcquiredStages.compare(
        stagesForThisCampaign,
        acquiredStagesForThisCampaign,
      );

      campaignParticipationOverview.stagesStatus = {
        totalStages: stagesComparison.totalNumberOfStages,
        reachedStages: stagesComparison.reachedStageNumber,
      };

      return campaignParticipationOverview;
    },
  );

  return campaignParticipationOverviewsWithStages;
};

export { findUserCampaignParticipationOverviews };
