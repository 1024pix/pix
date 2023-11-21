import * as trainingSerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';
import * as trainingSummarySerializer from '../../infrastructure/serializers/jsonapi/training-summary-serializer.js';
import * as trainingTriggerSerializer from '../../infrastructure/serializers/jsonapi/training-trigger-serializer.js';
import * as targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as queryParamsUtils from '../../infrastructure/utils/query-params-utils.js';

const findPaginatedTrainingSummaries = async function (
  request,
  h,
  dependencies = { trainingSummarySerializer, queryParamsUtils },
) {
  const { filter, page } = dependencies.queryParamsUtils.extractParameters(request.query);
  const { trainings, meta } = await usecases.findPaginatedTrainingSummaries({ filter, page });
  return dependencies.trainingSummarySerializer.serialize(trainings, meta);
};

const findTargetProfileSummaries = async function (
  request,
  h,
  dependencies = { targetProfileSummaryForAdminSerializer },
) {
  const { trainingId } = request.params;
  const targetProfileSummaries = await usecases.findTargetProfileSummariesForTraining({ trainingId });
  return dependencies.targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries);
};

const getById = async function (request, h, dependencies = { trainingSerializer }) {
  const { trainingId } = request.params;
  const training = await usecases.getTraining({ trainingId });
  return dependencies.trainingSerializer.serializeForAdmin(training);
};

const create = async function (request, h, dependencies = { trainingSerializer }) {
  const deserializedTraining = await dependencies.trainingSerializer.deserialize(request.payload);
  const createdTraining = await usecases.createTraining({ training: deserializedTraining });
  return h.response(dependencies.trainingSerializer.serialize(createdTraining)).created();
};

const update = async function (request, h, dependencies = { trainingSerializer }) {
  const { trainingId } = request.params;
  const training = await dependencies.trainingSerializer.deserialize(request.payload);
  const updatedTraining = await usecases.updateTraining({ training: { ...training, id: trainingId } });
  return dependencies.trainingSerializer.serialize(updatedTraining);
};

const createOrUpdateTrigger = async function (request, h, dependencies = { trainingTriggerSerializer }) {
  const { trainingId } = request.params;
  const { threshold, tubes, type } = await dependencies.trainingTriggerSerializer.deserialize(request.payload);

  const createdOrUpdatedTrainingTrigger = await DomainTransaction.execute(async (domainTransaction) => {
    return usecases.createOrUpdateTrainingTrigger({
      trainingId,
      threshold,
      tubes,
      type,
      domainTransaction,
    });
  });

  return dependencies.trainingTriggerSerializer.serialize(createdOrUpdatedTrainingTrigger);
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

const trainingController = {
  findPaginatedTrainingSummaries,
  findTargetProfileSummaries,
  getById,
  create,
  update,
  createOrUpdateTrigger,
  attachTargetProfiles,
};

export { trainingController };
