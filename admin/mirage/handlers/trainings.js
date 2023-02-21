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

function getTargetProfileSummariesForTraining(schema, request) {
  const trainingId = request.params.id;
  const training = schema.trainings.find(trainingId);

  const targetProfileSummaries = training.targetProfileSummaries.models;

  return this.serialize(
    { modelName: 'target-profile-summary', models: targetProfileSummaries },
    'target-profile-summary'
  );
}

function attachTargetProfilesToTraining(schema, request) {
  const trainingId = request.params.id;
  const targetProfileIdsToAttach = JSON.parse(request.requestBody)['target-profile-ids'];
  const availableTargetProfiles = schema.targetProfileSummaries.all().models;

  const matchingTargetProfiles = availableTargetProfiles.filter((targetProfile) =>
    targetProfileIdsToAttach.some((targetProfileId) => targetProfileId === targetProfile.attrs.id)
  );

  const training = schema.trainings.find(trainingId);

  const newTargetProfileIdsToAttach = matchingTargetProfiles
    .filter((matchingTargetProfile) => training.targetProfileSummaryIds.indexOf(matchingTargetProfile.attrs.id) === -1)
    .map((matchingTargetProfile) => matchingTargetProfile.attrs.id);

  training.update({ targetProfileSummaryIds: training.targetProfileSummaryIds.concat(newTargetProfileIdsToAttach) });
  return new Response(204);
}

function updateTraining(schema, request) {
  const trainingId = request.params.id;
  const params = JSON.parse(request.requestBody);

  const training = schema.trainings.find(trainingId);
  training.update(params.data.attributes);

  return training;
}

export {
  attachTargetProfilesToTraining,
  createTraining,
  findPaginatedTrainingSummaries,
  getTargetProfileSummariesForTraining,
  getTraining,
  updateTraining,
};
