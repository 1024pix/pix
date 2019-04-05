module.exports = ({ organizationId, retrieveCampaignReport, campaignRepository }) => {
  if (retrieveCampaignReport) {
    return campaignRepository.findByOrganizationIdWithCampaignReports(organizationId);
  }
  return campaignRepository.findByOrganizationId(organizationId);
};
