const usecases = require('../../domain/usecases');
const tubeSerializer = require('../../infrastructure/serializers/jsonapi/tube-serializer');

module.exports = {
  async getTubes(request, h) {
    const tubes = await usecases.getTubes();
    return h.response(tubeSerializer.serialize(tubes)).code(200);
  },
};
