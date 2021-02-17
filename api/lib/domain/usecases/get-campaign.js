const {
  NotFoundError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../domain/errors');

module.exports = async function getCampaign({
  campaignId,
  userId,
  badgeRepository,
  campaignRepository,
  campaignReportRepository,
  stageRepository,
}) {
  const integerCampaignId = parseInt(campaignId);
  if (!Number.isFinite(integerCampaignId)) {
    throw new NotFoundError(`Campaign not found for ID ${campaignId}`);
  }

  const userHasAccessToCampaign = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!userHasAccessToCampaign) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const [campaignReport, badges, stages] = await Promise.all([
    campaignReportRepository.get(integerCampaignId),
    badgeRepository.findByCampaignId(integerCampaignId),
    stageRepository.findByCampaignId(integerCampaignId),
  ]);

  campaignReport.badges = badges;
  campaignReport.stages = stages;
  return campaignReport;
};
