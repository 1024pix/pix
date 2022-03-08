const OrganizationToArchive = require('../models/OrganizationToArchive');

module.exports = async function archiveOrganization({ organizationId, organizationToArchiveRepository }) {
  const organizationToArchive = new OrganizationToArchive({ id: organizationId });
  organizationToArchive.archive();
  await organizationToArchiveRepository.save(organizationToArchive);
};
