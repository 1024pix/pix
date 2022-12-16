import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedSessionSummaries(schema, request) {
  const certificationCenterId = request.params.id;
  const sessionSummaries = schema.sessionSummaries.where({ certificationCenterId }).models;
  const rowCount = sessionSummaries.length;
  const pagination = getPaginationFromQueryParams(request.queryParams);
  const paginatedSessionSummaries = applyPagination(sessionSummaries, pagination);

  const json = this.serialize({ modelName: 'session-summary', models: paginatedSessionSummaries }, 'session-summary');

  json.meta = {
    hasSessions: sessionSummaries.length > 0,
    ...pagination,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };

  return json;
}
