import { findByCampaignId } from '../../../../quest/infrastructure/repositories/combined-courses/combined-course-repository.js';

const getCampaign = async function ({
  campaignId,
  badgeRepository,
  campaignReportRepository,
  stageCollectionRepository,
  stageAcquisitionRepository,
}) {
  const campaignReport = await campaignReportRepository.get(campaignId);

  const existingCombinedCourse = await findByCampaignId({ campaignId });

  if (existingCombinedCourse.length > 0) {
    const { id, name } = existingCombinedCourse[0];
    campaignReport.setCombinedCourse({ id, name });
  }

  if (campaignReport.isAssessment || campaignReport.isExam) {
    const badges = await badgeRepository.findByCampaignId(campaignId);
    const stageCollection = await stageCollectionRepository.findStageCollection({ campaignId });
    const masteryRates = await campaignReportRepository.findMasteryRates(campaignId);

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
