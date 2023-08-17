import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findPaginatedAssessmentResults(schema, request) {
  const queryParams = request.queryParams;
  const results = schema.campaignAssessmentResultMinimals.all().models;
  const rowCount = results.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedResults = applyPagination(results, pagination);

  const json = this.serialize(
    { modelName: 'campaign-assessment-result-minimal', models: paginatedResults },
    'campaign-assessment-result-minimal',
  );

  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
