const trainingSerializer = require('../../infrastructure/serializers/jsonapi/training-serializer');
const trainingSummarySerializer = require('../../infrastructure/serializers/jsonapi/training-summary-serializer');
const usecases = require('../../domain/usecases');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {
  async findPaginatedTrainingSummaries(request) {
    const { page } = queryParamsUtils.extractParameters(request.query);
    const { trainings, meta } = await usecases.findPaginatedTrainingSummaries({ page });
    return trainingSummarySerializer.serialize(trainings, meta);
  },
  async update(request) {
    const { trainingId } = request.params;
    const training = await trainingSerializer.deserialize(request.payload);
    const updatedTraining = await usecases.updateTraining({ training: { ...training, id: trainingId } });
    return trainingSerializer.serialize(updatedTraining);
  },
};
