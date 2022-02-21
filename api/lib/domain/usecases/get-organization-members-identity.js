module.exports = function getOrganizationMembersIdentity({ organizationId, organizationMemberIdentityRepository }) {
  return organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });
};
