import * as targetProfileSummaryForAdminSerializer from '../../../prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';
import * as trainingSerializer from '../../infrastructure/serializers/jsonapi/training-serializer.js';
import * as trainingSummarySerializer from '../../infrastructure/serializers/jsonapi/training-summary-serializer.js';
import * as trainingTriggerSerializer from '../../infrastructure/serializers/jsonapi/training-trigger-serializer.js';

const findPaginatedTrainingSummaries = async function (request) {
  const { filter, page } = request.query;

  const { trainings, meta } = await usecases.findPaginatedTrainingSummaries({ filter, page });
  return trainingSummarySerializer.serialize(trainings, meta);
};

const findTargetProfileSummaries = async function (request) {
  const { trainingId } = request.params;
  const targetProfileSummaries = await usecases.findTargetProfileSummariesForTraining({ trainingId });
  return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries);
};

const getById = async function (request) {
  const { trainingId } = request.params;
  const training = await usecases.getTraining({ trainingId });
  return trainingSerializer.serializeForAdmin(training);
};

const create = async function (request, h) {
  const deserializedTraining = await trainingSerializer.deserialize(request.payload);
  const createdTraining = await usecases.createTraining({ training: deserializedTraining });
  return h.response(trainingSerializer.serialize(createdTraining)).created();
};

const duplicate = async function (request, h) {
  const trainingId = request.params.trainingId;
  const createdTraining = await usecases.duplicateTraining({ trainingId });
  return h.response({ trainingId: createdTraining.id }).created();
};

const update = async function (request) {
  const { trainingId } = request.params;
  const training = await trainingSerializer.deserialize(request.payload);
  const updatedTraining = await usecases.updateTraining({ training: { ...training, id: trainingId } });
  return trainingSerializer.serializeForAdmin(updatedTraining);
};

const deleteTrainingTrigger = async function (request, h) {
  const { trainingId, trainingTriggerId } = request.params;
  await usecases.deleteTrainingTrigger({ trainingTriggerId, trainingId });
  return h.response({}).code(204);
};

const createOrUpdateTrigger = async function (request) {
  const { trainingId } = request.params;
  const { threshold, tubes, type } = await trainingTriggerSerializer.deserialize(request.payload);

  const createdOrUpdatedTrainingTrigger = await DomainTransaction.execute(async () => {
    return usecases.createOrUpdateTrainingTrigger({
      trainingId,
      threshold,
      tubes,
      type,
    });
  });

  return trainingTriggerSerializer.serialize(createdOrUpdatedTrainingTrigger);
};

const attachTargetProfiles = async function (request, h) {
  const { id: trainingId } = request.params;
  const targetProfileIds = request.payload['target-profile-ids'];
  await usecases.attachTargetProfilesToTraining({
    trainingId,
    targetProfileIds,
  });
  return h.response({}).code(204);
};

const detachTargetProfile = async function (request, h) {
  const { trainingId, targetProfileId } = request.params;
  await usecases.detachTargetProfilesFromTraining({
    trainingId,
    targetProfileId,
  });
  return h.response({}).code(204);
};

const findPaginatedTrainingsSummariesByTargetProfileId = async function (
  request,
  h,
  dependencies = { trainingSummarySerializer },
) {
  const { page } = request.query;
  const targetProfileId = request.params.id;

  const { trainings, meta } = await usecases.findPaginatedTargetProfileTrainingSummaries({
    targetProfileId,
    page,
  });
  return dependencies.trainingSummarySerializer.serialize(trainings, meta);
};

export const trainingController = {
  findPaginatedTrainingSummaries,
  findPaginatedTrainingsSummariesByTargetProfileId,
  findTargetProfileSummaries,
  getById,
  create,
  duplicate,
  deleteTrainingTrigger,
  update,
  createOrUpdateTrigger,
  attachTargetProfiles,
  detachTargetProfile,
};
