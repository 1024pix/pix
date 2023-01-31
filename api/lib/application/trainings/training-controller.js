const trainingSerializer = require('../../infrastructure/serializers/jsonapi/training-serializer');
const trainingSummarySerializer = require('../../infrastructure/serializers/jsonapi/training-summary-serializer');
const trainingTriggerSerializer = require('../../infrastructure/serializers/jsonapi/training-trigger-serializer');
const usecases = require('../../domain/usecases');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {
  async findPaginatedTrainingSummaries(request) {
    const { page } = queryParamsUtils.extractParameters(request.query);
    const { trainings, meta } = await usecases.findPaginatedTrainingSummaries({ page });
    return trainingSummarySerializer.serialize(trainings, meta);
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
};
