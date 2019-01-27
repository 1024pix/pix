module.exports = function getOrganizationMemberships({ organizationId, membershipRepository }) {
  return membershipRepository.findByOrganizationId(organizationId);
};
