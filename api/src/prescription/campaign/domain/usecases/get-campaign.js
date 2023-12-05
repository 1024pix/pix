const getCampaign = async function ({
  campaignId,
  badgeRepository,
  campaignReportRepository,
  stageCollectionRepository,
}) {
  const campaignReport = await campaignReportRepository.get(campaignId);

  if (campaignReport.isAssessment) {
    const [badges, stageCollection, aggregatedResults] = await Promise.all([
      badgeRepository.findByCampaignId(campaignId),
      stageCollectionRepository.findStageCollection({ campaignId: campaignId }),
      campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId),
    ]);

    campaignReport.setBadges(badges);
    campaignReport.setStages(stageCollection);

    campaignReport.computeAverageResult(aggregatedResults.masteryRates);
    campaignReport.computeReachedStage(aggregatedResults.validatedSkillsCounts);
  }
  return campaignReport;
};

export { getCampaign };
