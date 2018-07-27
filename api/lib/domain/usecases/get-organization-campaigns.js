module.exports = ({ organizationId, campaignRepository }) => {
  return campaignRepository.findByOrganization(organizationId);
};
