export default async function findGroupByOrganization({ organizationId, groupRepository }) {
  return groupRepository.findByOrganizationId({ organizationId });
}
