import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';

const update = async function (request, h) {
  const stageId = request.params.id;
  const { targetProfileId, ...stageDataFromPayload } = request.payload.data.attributes;
  await usecases.updateStage({
    payloadStage: {
      id: stageId,
      targetProfileId: targetProfileId,
      attributesToUpdate: stageDataFromPayload,
    },
  });
  return h.response().code(204);
};

const stageController = { update };

export { stageController };
