module.exports = async function findGroupByOrganization({ organizationId, groupRepository }) {
  return groupRepository.findByOrganizationId({ organizationId });
};
