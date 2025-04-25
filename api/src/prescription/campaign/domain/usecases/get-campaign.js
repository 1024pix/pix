const getCampaign = async function ({
  campaignId,
  badgeRepository,
  campaignReportRepository,
  stageCollectionRepository,
  stageAcquisitionRepository,
}) {
  const campaignReport = await campaignReportRepository.get(campaignId);

  if (campaignReport.isAssessment || campaignReport.isExam) {
    const [badges, stageCollection, masteryRates] = await Promise.all([
      badgeRepository.findByCampaignId(campaignId),
      stageCollectionRepository.findStageCollection({ campaignId }),
      campaignReportRepository.findMasteryRates(campaignId),
    ]);

    campaignReport.setBadges(badges);
    campaignReport.computeAverageResult(masteryRates);

    if (stageCollection.hasStage) {
      campaignReport.setStages(stageCollection);
      const reachedStage = await stageAcquisitionRepository.getAverageReachedStageByCampaignId(campaignId);
      campaignReport.setReachedStage(reachedStage);
    }
  }

  return campaignReport;
};

export { getCampaign };
