import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function getPaginatedJuryCertificationSummariesBySessionId(schema, request) {
  const queryParams = request.queryParams;
  const [{ juryCertificationSummaries }] = schema.sessions.where({ id: request.params.id }).models;
  const rowCount = juryCertificationSummaries.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedJuryCertificationSummaries = applyPagination(juryCertificationSummaries.models, pagination);

  const json = this.serialize(
    { modelName: 'jury-certification-summary', models: paginatedJuryCertificationSummaries },
    'jury-certification-summary',
  );

  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
