import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import * as badgeCriterionSerializer from '../../infrastructure/serializers/jsonapi/badge-criterion-serializer.js';

const updateCriterion = async (request, h, dependencies = { usecases, badgeCriterionSerializer }) => {
  const badgeCriterionId = request.params.badgeCriterionId;
  const deserializedPayload = await dependencies.badgeCriterionSerializer.deserialize(request.payload);
  await dependencies.usecases.updateBadgeCriterion({
    badgeCriterion: {
      id: badgeCriterionId,
      ...deserializedPayload,
    },
  });
  return h.response().code(204);
};

const badgeCriteriaController = { updateCriterion };
export default badgeCriteriaController;
