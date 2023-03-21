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

function createOrUpdateTrainingTrigger(schema, request) {
  const body = JSON.parse(request.requestBody);
  const attributes = body.data.attributes;

  const trainingTrigger = schema.trainingTriggers.findOrCreateBy({
    trainingId: request.params.id,
    type: attributes.type,
  });

  const tubes = schema.tubes.all().models.filter(({ id }) => {
    return attributes.tubes.map(({ tubeId }) => tubeId).includes(id);
  });

  const triggerTubes = tubes.map((tube) => {
    const level = attributes.tubes.find(({ tubeId }) => tubeId === tube.id).level;
    return schema.triggerTubes.create({ tube, level });
  });

  const thematics = schema.thematics.all().models.filter(({ tubes: thematicTubes }) => {
    return thematicTubes.models.find(({ id }) => triggerTubes.map(({ tube }) => tube.id).includes(id));
  });

  const competences = schema.competences.all().models.filter(({ thematics: competenceThematics }) => {
    return competenceThematics.models.find(({ id }) => thematics.map(({ id }) => id).includes(id));
  });

  const areas = schema.areas.all().models.filter(({ competences: areaCompetences }) => {
    return areaCompetences.models.find(({ id }) => competences.map(({ id }) => id).includes(id));
  });

  thematics.triggerTubes = triggerTubes;
  competences.thematics = thematics;
  areas.competences = competences;

  trainingTrigger.update({ ...attributes, areas, tubesCount: tubes.length });
  return trainingTrigger;
}

export {
  attachTargetProfilesToTraining,
  createOrUpdateTrainingTrigger,
  createTraining,
  findPaginatedTrainingSummaries,
  getTargetProfileSummariesForTraining,
  getTraining,
  updateTraining,
};
