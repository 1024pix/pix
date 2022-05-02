import get from 'lodash/get';
import slice from 'lodash/slice';

function getOrganizationPlaces(schema) {
  return schema.organizationPlaces.all();
}

function getOrganizationInvitations(schema, request) {
  const ownerOrganizationId = request.params.id;
  return schema.organizationInvitations.where({ ownerOrganizationId });
}

function findPaginatedOrganizationMemberships(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const memberships = schema.memberships.where({ organizationId, disabledAt: undefined }).models;
  const rowCount = memberships.length;

  const pagination = _getPaginationFromQueryParams(queryParams);
  const paginatedMemberships = _applyPagination(memberships, pagination);

  const json = this.serialize({ modelName: 'membership', models: paginatedMemberships }, 'membership');
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

export { archiveOrganization, getOrganizationInvitations, getOrganizationPlaces, findPaginatedOrganizationMemberships };
