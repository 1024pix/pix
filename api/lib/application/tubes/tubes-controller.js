const usecases = require('../../domain/usecases');
const tubeSerializer = require('../../infrastructure/serializers/jsonapi/tube-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async getTubes(request, h) {
    const locale = extractLocaleFromRequest(request);
    const tubes = await usecases.getTubesFromPixFramework(locale);
    return h.response(tubeSerializer.serialize(tubes)).code(200);
  },
};
