const usecases = require('../../domain/usecases');
const stageSerializer = require('../../infrastructure/serializers/jsonapi/stage-serializer');

module.exports = {
  async create(request, h) {
    const stage = stageSerializer.deserialize(request.payload);
    const newStage = await usecases.createStage({ stage });
    return h.response(stageSerializer.serialize(newStage)).created();
  },

  async updateStage(request, h) {
    const stageId = request.params.id;
    const stage = stageSerializer.deserialize(request.payload);
    await usecases.updateStage({ ...stage, stageId });
    return h.response({}).code(204);
  },

  async getStageDetails(request) {
    const stageId = request.params.id;
    const stage = await usecases.getStageDetails({ stageId });
    return stageSerializer.serialize(stage);
  },
};
