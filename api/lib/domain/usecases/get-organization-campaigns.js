module.exports = function getOrganizationCampaigns({ organizationId, campaignRepository }) {
  return campaignRepository.findByOrganizationIdWithCampaignReports(organizationId);
};
