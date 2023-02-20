import organizationRepository from '../../lib/infrastructure/repositories/organization-repository';

function organizeOrganizationsByExternalId(organizations) {
  const organizationsByExternalId = {};

  organizations.forEach((organization) => {
    if (organization.externalId) {
      organizationsByExternalId[organization.externalId] = organization;
    }
  });

  return organizationsByExternalId;
}

function findOrganizationsByExternalIds({ checkedData }) {
  const externalIds = checkedData.map((data) => data.externalId);
  return organizationRepository.findByExternalIdsFetchingIdsOnly(externalIds).then((organizations) => {
    return organizations.map((organization) => ({ id: organization.id, externalId: organization.externalId }));
  });
}

export default {
  findOrganizationsByExternalIds,
  organizeOrganizationsByExternalId,
};
