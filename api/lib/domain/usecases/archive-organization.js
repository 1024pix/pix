export default async function archiveOrganization({ organizationId, userId, organizationForAdminRepository }) {
  await organizationForAdminRepository.archive({ id: organizationId, archivedBy: userId });
  return await organizationForAdminRepository.get(organizationId);
}
