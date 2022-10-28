import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedAndFilteredTutorials(schema, request) {
  const queryParams = request.queryParams;
  const type = queryParams['filter[type]'];

  let tutorials = [];
  if (type === 'recommended') {
    tutorials = _findPaginatedAndFilteredRecommendedTutorials(schema, request);
  } else {
    tutorials = _findPaginatedAndFilteredSavedTutorials(schema);
  }

  const rowCount = tutorials.length;
  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedTutorials = applyPagination(tutorials, pagination);

  const json = this.serialize({ modelName: 'tutorial', models: paginatedTutorials }, 'tutorial');

  json.meta = {
    pagination: {
      ...pagination,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    },
  };
  return json;
}

function _findPaginatedAndFilteredRecommendedTutorials(schema, request) {
  const queryParams = request.queryParams;
  const competenceFilters = queryParams['filter[competences]'];

  let tutorials;

  if (competenceFilters) {
    tutorials = [schema.tutorials.create({ name: `Le tuto de la compétence ${competenceFilters[0]}` })];
  } else {
    tutorials = schema.tutorials.all().models;
  }
  return tutorials;
}

function _findPaginatedAndFilteredSavedTutorials(schema) {
  const tutorials = schema.tutorials.all().models;
  const userSavedTutorialIds = schema.userSavedTutorials
    .all()
    .models.map((userSavedTutorial) => userSavedTutorial.tutorialId);
  return tutorials.filter((tutorial) => userSavedTutorialIds.includes(tutorial.id));
}
