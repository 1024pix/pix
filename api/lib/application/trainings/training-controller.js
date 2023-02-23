const trainingSerializer = require('../../infrastructure/serializers/jsonapi/training-serializer.js');
const trainingSummarySerializer = require('../../infrastructure/serializers/jsonapi/training-summary-serializer.js');
const trainingTriggerSerializer = require('../../infrastructure/serializers/jsonapi/training-trigger-serializer.js');
const targetProfileSummaryForAdminSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js');
const usecases = require('../../domain/usecases/index.js');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils.js');

module.exports = {
  async findPaginatedTrainingSummaries(request) {
    const { page } = queryParamsUtils.extractParameters(request.query);
    const { trainings, meta } = await usecases.findPaginatedTrainingSummaries({ page });
    return trainingSummarySerializer.serialize(trainings, meta);
  },
  async findTargetProfileSummaries(request) {
    const { trainingId } = request.params;
    const targetProfileSummaries = await usecases.findTargetProfileSummariesForTraining({ trainingId });
    return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries);
  },
  async getById(request) {
    const { trainingId } = request.params;
    const training = await usecases.getTraining({ trainingId });
    return trainingSerializer.serialize(training);
  },
  async create(request, h) {
    const deserializedTraining = await trainingSerializer.deserialize(request.payload);
    const createdTraining = await usecases.createTraining({ training: deserializedTraining });
    return h.response(trainingSerializer.serialize(createdTraining)).created();
  },
  async update(request) {
    const { trainingId } = request.params;
    const training = await trainingSerializer.deserialize(request.payload);
    const updatedTraining = await usecases.updateTraining({ training: { ...training, id: trainingId } });
    return trainingSerializer.serialize(updatedTraining);
  },
  async createOrUpdateTrigger(request) {
    const { trainingId } = request.params;
    const { threshold, tubes, type } = await trainingTriggerSerializer.deserialize(request.payload);
    const createdOrUpdatedTrainingTrigger = await usecases.createOrUpdateTrainingTrigger({
      trainingId,
      threshold,
      tubes,
      type,
    });
    return trainingTriggerSerializer.serialize(createdOrUpdatedTrainingTrigger);
  },
  async attachTargetProfiles(request, h) {
    const { id: trainingId } = request.params;
    const targetProfileIds = request.payload['target-profile-ids'];
    await usecases.attachTargetProfilesToTraining({
      trainingId,
      targetProfileIds,
    });
    return h.response({}).code(204);
  },
};
