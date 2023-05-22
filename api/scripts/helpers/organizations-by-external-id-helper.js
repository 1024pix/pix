import * as organizationRepository from '../../lib/infrastructure/repositories/organization-repository.js';

function organizeOrganizationsByExternalId(organizations) {
  const organizationsByExternalId = {};

  organizations.forEach((organization) => {
    if (organization.externalId) {
      organizationsByExternalId[organization.externalId] = organization;
    }
  });

  return organizationsByExternalId;
}

function findOrganizationsByExternalIds({ checkedData }, injectedOrganizationRepository = organizationRepository) {
  const externalIds = checkedData.map((data) => data.externalId);
  return injectedOrganizationRepository.findByExternalIdsFetchingIdsOnly(externalIds).then((organizations) => {
    return organizations.map((organization) => ({ id: organization.id, externalId: organization.externalId }));
  });
}

export { findOrganizationsByExternalIds, organizeOrganizationsByExternalId };
