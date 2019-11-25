const organizationRepository = require('../lib/infrastructure/repositories/organization-repository');

function organizeOrganizationsByExternalId(organizations) {
  const organizationsByExternalId = {};

  organizations.forEach((organization) => {
    if (organization.externalId) {
      organization.externalId = organization.externalId.toUpperCase();
      organizationsByExternalId[organization.externalId] = organization;
    }
  });

  return organizationsByExternalId;
}

function findOrganizationsByExternalIds({ checkedData }) {
  const externalIds = checkedData.map((data) => data.externalId.toUpperCase());
  return organizationRepository.findByExternalIds(externalIds).then((organizations) => {
    return organizations.map((organization) => ({ id: organization.id, externalId: organization.externalId }));
  });
}

module.exports = {
  findOrganizationsByExternalIds,
  organizeOrganizationsByExternalId,
};
