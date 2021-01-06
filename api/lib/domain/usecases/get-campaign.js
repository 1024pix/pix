const { NotFoundError } = require('../../domain/errors');

module.exports = async function getCampaign({ campaignId, campaignReportRepository, stageRepository }) {
  const integerCampaignId = parseInt(campaignId);
  if (!Number.isFinite(integerCampaignId)) {
    throw new NotFoundError(`Campaign not found for ID ${campaignId}`);
  }

  const [campaignReport, stages] = await Promise.all([
    campaignReportRepository.get(integerCampaignId),
    stageRepository.findByCampaignId(integerCampaignId),
  ]);

  campaignReport.stages = stages;
  return campaignReport;
};
