import * as stageCollectionRepository from '../../infrastructure/repositories/target-profile-management/stage-collection-repository.js';
import { StageCollectionUpdate } from '../../domain/models/target-profile-management/StageCollectionUpdate.js';

const update = async function (request, h) {
  const targetProfileId = request.params.id;
  const stagesDTO = request.payload.data.attributes.stages;
  const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
  const stageCollectionUpdate = new StageCollectionUpdate({ stagesDTO, stageCollection });
  await stageCollectionRepository.update(stageCollectionUpdate);
  return h.response({}).code(204);
};

const stageCollectionController = { update };

export { stageCollectionController };
