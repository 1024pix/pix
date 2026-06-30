import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

function getOrganizationPlaces(schema) {
  return schema.organizationPlaces.all();
}

function getOrganizationPlacesStatistics() {
  return {
    data: {
      id: '1_places_statistics',
      type: 'organization-places-statistics',
      attributes: {
        total: 10,
        occupied: 1,
        available: 9,
        'anonymous-seat': 1,
        'has-reached-maximum-places-limit': false,
      },
    },
  };
}

function getOrganizationStatistics() {
  return {
    data: {
      id: '123_organization_statistics',
      type: 'organization-statistics',
      attributes: {
        'total-participants-count': 44,
      },
    },
  };
}

function getOrganizationInvitations(schema, request) {
  const organizationId = request.params.id;
  return schema.organizationInvitations.where({ organizationId });
}

function findPaginatedOrganizationMemberships(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const organizationRole = queryParams['filter[organizationRole]'];
  const withOrganizationRoleFilter = ['ADMIN', 'MEMBER'].some((role) => role === organizationRole);

  let filters = {
    organizationId,
    disabledAt: undefined,
  };

  if (withOrganizationRoleFilter) {
    filters = {
      organizationId,
      disabledAt: undefined,
      organizationRole,
    };
  }

  const organizationMemberships = schema.organizationMemberships.where(filters).models;

  const rowCount = organizationMemberships.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedMemberships = applyPagination(organizationMemberships, pagination);

  const json = this.serialize(
    { modelName: 'organizationMembership', models: paginatedMemberships },
    'organizationMembership',
  );
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };

  return json;
}

function findOrganizationCampaigns(schema, request) {
  const organizationId = request.params.id;
  const campaigns = schema.campaigns.where({ organizationId }).models;
  const json = this.serialize({ modelName: 'campaign', models: campaigns }, 'campaign');
  json.meta = { rowCount: campaigns.length };
  return json;
}

function archiveOrganization(schema, request) {
  const id = request.params.id;

  const organization = schema.organizations.find(id);
  return organization.update({ archivistFullName: 'Clément Tine', archivedAt: new Date('2022-02-02') });
}

function findPaginatedFilteredOrganizations(schema) {
  const organizations = schema.organizations.all().models;
  const json = this.serialize({ modelName: 'organization', models: organizations }, 'organization');
  json.meta = {
    page: 1,
    pageSize: 5,
    rowCount: 5,
    pageCount: 1,
  };
  return json;
}

function getOrganizationAttachedCertificationCenters(schema, request) {
  const organizationId = request.params.id;
  return schema.attachedCertificationCenters.where({ organizationId });
}

export {
  archiveOrganization,
  findOrganizationCampaigns,
  findPaginatedFilteredOrganizations,
  findPaginatedOrganizationMemberships,
  getOrganizationAttachedCertificationCenters,
  getOrganizationInvitations,
  getOrganizationPlaces,
  getOrganizationPlacesStatistics,
  getOrganizationStatistics,
};
