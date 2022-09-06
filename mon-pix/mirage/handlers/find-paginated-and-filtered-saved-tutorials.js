import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedAndFilteredSavedTutorials(schema, request) {
  const queryParams = request.queryParams;
  const competenceFilters = queryParams['filter[competences]'];

  let tutorials;

  if (competenceFilters) {
    tutorials = [schema.tutorials.create({ name: `Le tuto de la compétence ${competenceFilters[0]}` })];
    schema.userTutorials.create({ tutorial: tutorials[0] });
  } else {
    tutorials = schema.tutorials.all().models;
  }

  const userTutorialIds = schema.userTutorials.all().models.map((userTutorial) => userTutorial.tutorialId);
  const savedTutorials = tutorials.filter((tutorial) => userTutorialIds.includes(tutorial.id));

  const rowCount = savedTutorials.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedTutorials = applyPagination(savedTutorials, pagination);

  const json = this.serialize({ modelName: 'tutorial', models: paginatedTutorials }, 'tutorial');

  json.meta = {
    ...pagination,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
