module.exports = function getOrganizationMembers({ organizationId, organizationMemberRepository }) {
  return organizationMemberRepository.getAllByOrganizationId({ organizationId });
};
