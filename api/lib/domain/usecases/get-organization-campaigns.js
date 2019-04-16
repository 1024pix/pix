module.exports = ({ organizationId, campaignRepository }) => {
  return campaignRepository.findByOrganizationIdWithCampaignReports(organizationId);
};
