import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedRecommendedTutorials(schema, request) {
  const queryParams = request.queryParams;
  const tutorials = schema.tutorials.all().models;
  const rowCount = tutorials.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedTutorials = applyPagination(tutorials, pagination);

  const json = this.serialize({ modelName: 'tutorial', models: paginatedTutorials }, 'tutorial');

  json.meta = {
    ...pagination,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
