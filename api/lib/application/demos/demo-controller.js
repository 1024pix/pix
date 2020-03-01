const usecases = require('../../domain/usecases');
const demoSerializer = require('../../infrastructure/serializers/jsonapi/demo-serializer');

module.exports = {

  async get(request) {
    const demoId = request.params.id;

    const demo = await usecases.getDemo({ demoId });
    return demoSerializer.serialize(demo);
  },
};
