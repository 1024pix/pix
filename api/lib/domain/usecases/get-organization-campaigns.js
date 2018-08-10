module.exports = ({ organizationId, campaignRepository }) => {
  return campaignRepository.findByOrganizationId(organizationId);
};
