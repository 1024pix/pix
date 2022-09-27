import get from 'lodash/get';
import slice from 'lodash/slice';

function getOrganizationPlaces(schema) {
  return schema.organizationPlaces.all();
}

function getOrganizationPlacesCapacity() {
  return {
    data: {
      id: '1_places_capacity',
      type: 'organization-places-capacities',
      attributes: {
        categories: [
          { count: 7777, category: 'FREE_RATE' },
          { count: 0, category: 'PUBLIC_RATE' },
          { count: 0, category: 'REDUCE_RATE' },
          { count: 0, category: 'SPECIAL_REDUCE_RATE' },
          { count: 0, category: 'FULL_RATE' },
        ],
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

  const pagination = _getPaginationFromQueryParams(queryParams);
  const paginatedMemberships = _applyPagination(organizationMemberships, pagination);

  const json = this.serialize(
    { modelName: 'organizationMembership', models: paginatedMemberships },
    'organizationMembership'
  );
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };

  return json;
}

function archiveOrganization(schema, request) {
  const id = request.params.id;

  const organization = schema.organizations.find(id);
  return organization.update({ archivistFullName: 'Clément Tine', archivedAt: new Date('2022-02-02') });
}

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(get(queryParams, 'page[size]', 10)),
    page: parseInt(get(queryParams, 'page[number]', 1)),
  };
}

function _applyPagination(memberships, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return slice(memberships, start, end);
}

export {
  archiveOrganization,
  getOrganizationInvitations,
  getOrganizationPlaces,
  getOrganizationPlacesCapacity,
  findPaginatedOrganizationMemberships,
};
