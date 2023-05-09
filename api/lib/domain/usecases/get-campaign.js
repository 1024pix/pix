import { NotFoundError, UserNotAuthorizedToAccessEntityError } from '../../domain/errors.js';
import * as stageCollectionRepository from '../../infrastructure/repositories/user-campaign-results/stage-collection-repository.js';

const getCampaign = async function ({
  campaignId,
  userId,
  badgeRepository,
  campaignRepository,
  campaignReportRepository,
}) {
  const integerCampaignId = parseInt(campaignId);
  if (!Number.isFinite(integerCampaignId)) {
    throw new NotFoundError(`Campaign not found for ID ${campaignId}`);
  }

  const userHasAccessToCampaign = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
    campaignId,
    userId
  );
  if (!userHasAccessToCampaign) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

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
