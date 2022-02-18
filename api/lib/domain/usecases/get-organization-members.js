module.exports = function getOrganizationMembers({ organizationId, organizationMemberRepository }) {
  return organizationMemberRepository.findAllByOrganizationId({ organizationId });
};
