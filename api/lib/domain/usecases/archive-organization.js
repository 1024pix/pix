const OrganizationToArchive = require('../models/OrganizationToArchive');

module.exports = async function archiveOrganization({
  organizationId,
  userId,
  organizationToArchiveRepository,
  organizationForAdminRepository,
}) {
  const organizationToArchive = new OrganizationToArchive({ id: organizationId });
  organizationToArchive.archive({ archivedBy: userId });
  await organizationToArchiveRepository.save(organizationToArchive);

  return await organizationForAdminRepository.get(organizationId);
};
