import { UserNotAuthorizedToAccessEntityError } from '../../domain/errors.js';

const getCampaign = async function ({
  campaignId,
  userId,
  badgeRepository,
  campaignRepository,
  campaignReportRepository,
  stageCollectionRepository,
}) {
  const integerCampaignId = parseInt(campaignId);
  const campaignReport = await campaignReportRepository.get(integerCampaignId);

  if (campaignReport.isAssessment) {
    const [badges, stageCollection, aggregatedResults] = await Promise.all([
      badgeRepository.findByCampaignId(integerCampaignId),
      stageCollectionRepository.findStageCollection({ campaignId: integerCampaignId }),
      campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(integerCampaignId),
    ]);

    campaignReport.setBadges(badges);
    campaignReport.setStages(stageCollection);

    campaignReport.computeAverageResult(aggregatedResults.masteryRates);
    campaignReport.computeReachedStage(aggregatedResults.validatedSkillsCounts);
  }
  return campaignReport;
};

export { getCampaign };
