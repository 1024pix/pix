const getOrganizationMemberIdentities = function ({ organizationId, organizationMemberIdentityRepository }) {
  return organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });
};

export { getOrganizationMemberIdentities };
