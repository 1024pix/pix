import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

function findPaginatedTrainingSummaries(schema, request) {
  const trainingSummaries = schema.trainingSummaries.all().models;

  const queryParams = request.queryParams;

  const rowCount = trainingSummaries.length;
  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedTrainingSummaries = applyPagination(trainingSummaries, pagination);

  const json = this.serialize(
    { modelName: 'training-summary', models: paginatedTrainingSummaries },
    'training-summary'
  );

  json.meta = {
    pagination: {
      ...pagination,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    },
  };
  return json;
}

function createTraining(schema, request) {
  const params = JSON.parse(request.requestBody);

  return schema.create('training', {
    ...params.data.attributes,
  });
}

function getTraining(schema, request) {
  const trainingId = request.params.id;

  return schema.trainings.find(trainingId);
}

export { findPaginatedTrainingSummaries, createTraining, getTraining };
