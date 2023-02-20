import trainingSerializer from '../../infrastructure/serializers/jsonapi/training-serializer';
import trainingSummarySerializer from '../../infrastructure/serializers/jsonapi/training-summary-serializer';
import trainingTriggerSerializer from '../../infrastructure/serializers/jsonapi/training-trigger-serializer';
import targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer';
import usecases from '../../domain/usecases';
import queryParamsUtils from '../../infrastructure/utils/query-params-utils';

export default {
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
