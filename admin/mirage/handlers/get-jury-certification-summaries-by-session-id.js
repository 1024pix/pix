import get from 'lodash/get';
import slice from 'lodash/slice';

export function getPaginatedJuryCertificationSummariesBySessionId(schema, request) {
  const queryParams = request.queryParams;
  const [{ juryCertificationSummaries }] = schema.sessions.where({ id: request.params.id }).models;
  const rowCount = juryCertificationSummaries.length;

  const pagination = _getPaginationFromQueryParams(queryParams);
  const paginatedJuryCertificationSummaries = _applyPagination(juryCertificationSummaries.models, pagination);

  const json = this.serialize(
    { modelName: 'jury-certification-summary', models: paginatedJuryCertificationSummaries },
    'jury-certification-summary'
  );

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
    pageSize: parseInt(get(queryParams, 'page[size]', 10)),
    page: parseInt(get(queryParams, 'page[number]', 1)),
  };
}

function _applyPagination(juryCertificationSummaries, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return slice(juryCertificationSummaries, start, end);
}
