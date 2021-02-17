const { NotFoundError } = require('../../domain/errors');

module.exports = async function getCampaign({
  campaignId,
  badgeRepository,
  campaignReportRepository,
  stageRepository,
}) {
  const integerCampaignId = parseInt(campaignId);
  if (!Number.isFinite(integerCampaignId)) {
    throw new NotFoundError(`Campaign not found for ID ${campaignId}`);
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
