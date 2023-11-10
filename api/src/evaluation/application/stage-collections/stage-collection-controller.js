import { evaluationUsecases as usecases } from '../../../evaluation/domain/usecases/index.js';

const update = async function (request, h) {
  const targetProfileId = request.params.id;
  const stagesFromPayload = request.payload.data.attributes.stages;
  await usecases.createOrUpdateStageCollection({ targetProfileId, stagesFromPayload });
  return h.response({}).code(204);
};

const stageCollectionController = { update };

export { stageCollectionController };
