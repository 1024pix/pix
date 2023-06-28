const findGroupsByOrganization = async function ({ organizationId, groupRepository }) {
  return groupRepository.findByOrganizationId({ organizationId });
};

export { findGroupsByOrganization };
