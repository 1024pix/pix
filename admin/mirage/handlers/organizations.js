import _ from 'lodash';

export function findPaginatedOrganizationMemberships(schema, request) {
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

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(_.get(queryParams, 'page[size]',  10)),
    page: parseInt(_.get(queryParams, 'page[number]',  1))
  };
}

function _applyPagination(summaries, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return _.slice(summaries, start, end);
}
