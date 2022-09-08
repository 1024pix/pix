import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedAndFilteredRecommendedTutorials(schema, request) {
  const queryParams = request.queryParams;
  const competenceFilters = queryParams['filter[competences]'];

  let tutorials;

  if (competenceFilters) {
    tutorials = [schema.tutorials.create({ name: `Le tuto de la compétence ${competenceFilters[0]}` })];
  } else {
    tutorials = schema.tutorials.all().models;
  }

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
