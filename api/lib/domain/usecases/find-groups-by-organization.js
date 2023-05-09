const findGroupByOrganization = async function ({ organizationId, groupRepository }) {
  return groupRepository.findByOrganizationId({ organizationId });
};

export { findGroupByOrganization };
