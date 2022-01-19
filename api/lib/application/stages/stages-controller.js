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
    const {
      title,
      message,
      threshold,
      'prescriber-title': prescriberTitle,
      'prescriber-description': prescriberDescription,
    } = request.payload.data.attributes;
    await usecases.updateStage({ stageId, title, message, threshold, prescriberTitle, prescriberDescription });
    return h.response({}).code(204);
  },

  async getStageDetails(request) {
    const stageId = request.params.id;
    const stage = await usecases.getStageDetails({ stageId });
    return stageSerializer.serialize(stage);
  },
};
