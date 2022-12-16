import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedOrganizationMemberships(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const memberships = schema.memberships.where({ organizationId }).models;
  const rowCount = memberships.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedMemberships = applyPagination(memberships, pagination);

  const json = this.serialize({ modelName: 'membership', models: paginatedMemberships }, 'membership');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
