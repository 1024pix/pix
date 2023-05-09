const archiveOrganization = async function ({ organizationId, userId, organizationForAdminRepository }) {
  await organizationForAdminRepository.archive({ id: organizationId, archivedBy: userId });
  return await organizationForAdminRepository.get(organizationId);
};

export { archiveOrganization };
