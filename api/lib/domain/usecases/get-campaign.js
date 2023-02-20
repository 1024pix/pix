import { NotFoundError, UserNotAuthorizedToAccessEntityError } from '../../domain/errors';

export default async function getCampaign({
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

  const [campaignReport, badges, stages, masteryRates] = await Promise.all([
    campaignReportRepository.get(integerCampaignId),
    badgeRepository.findByCampaignId(integerCampaignId),
    campaignRepository.findStages({ campaignId: integerCampaignId }),
    campaignReportRepository.findMasteryRates(integerCampaignId),
  ]);

  campaignReport.badges = badges;
  campaignReport.stages = stages;
  if (campaignReport.isAssessment) {
    campaignReport.computeAverageResult(masteryRates);
  }
  return campaignReport;
}
