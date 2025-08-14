import * as injectedBadgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as injectedStageAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as injectedCampaignReportRepository from '../../infrastructure/repositories/campaign-report-repository.js';
import * as injectedStageCollectionRepository from '../../infrastructure/repositories/stage-collection-repository.js';
const getCampaign = async function ({
  campaignId,
  badgeRepository = injectedBadgeRepository,
  campaignReportRepository = injectedCampaignReportRepository,
  stageCollectionRepository = injectedStageCollectionRepository,
  stageAcquisitionRepository = injectedStageAcquisitionRepository,
} = {}) {
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
