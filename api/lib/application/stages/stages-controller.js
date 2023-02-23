const _ = require('lodash');
const usecases = require('../../domain/usecases/index.js');
const stageSerializer = require('../../infrastructure/serializers/jsonapi/stage-serializer');
const stageCollectionRepository = require('../../infrastructure/repositories/target-profile-management/stage-collection-repository');

module.exports = {
  async create(request, h) {
    const stage = stageSerializer.deserialize(request.payload);
    const stageCollection = await stageCollectionRepository.getByTargetProfileId(stage.targetProfileId);
    const stageIdsBefore = stageCollection.stages.map((stage) => stage.id);
    const updatedStageCollection = usecases.createStage({ stageCollection, stage });
    const stageIdsAfter = await stageCollectionRepository.save(updatedStageCollection);
    const [createdStageId] = _.difference(stageIdsAfter, stageIdsBefore);
    return h.response(stageSerializer.serialize({ id: createdStageId })).created();
  },

  async update(request, h) {
    const stage = stageSerializer.deserialize(request.payload);
    const stageCollection = await stageCollectionRepository.getByTargetProfileId(stage.targetProfileId);
    const updatedStageCollection = usecases.updateStage({ stageCollection, stage });
    await stageCollectionRepository.save(updatedStageCollection);
    return h.response({}).code(204);
  },
};
