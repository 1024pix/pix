const stageCollectionRepository = require('../../infrastructure/repositories/target-profile-management/stage-collection-repository');
const StageCollectionUpdate = require('../../domain/models/target-profile-management/StageCollectionUpdate');

module.exports = {
  async update(request, h) {
    const targetProfileId = request.params.id;
    const stagesDTO = request.payload.data.attributes.stages;
    const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
    const stageCollectionUpdate = new StageCollectionUpdate({ stagesDTO, stageCollection });
    await stageCollectionRepository.update(stageCollectionUpdate);
    return h.response({}).code(204);
  },
};
