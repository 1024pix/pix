import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSummarySerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-summary-serializer.js';

const findPaginatedTrainings = async function (request, h, dependencies = { trainingSummarySerializer }) {
  const { page } = request.query;
  const targetProfileId = request.params.id;

  const { trainings, meta } = await devcompUsecases.findPaginatedTargetProfileTrainingSummaries({
    targetProfileId,
    page,
  });
  return dependencies.trainingSummarySerializer.serialize(trainings, meta);
};

const targetProfileController = {
  findPaginatedTrainings,
};

export { targetProfileController };
