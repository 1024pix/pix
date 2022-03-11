const usecases = require('../../domain/usecases');
const frameworkAreasSerializer = require('../../infrastructure/serializers/jsonapi/framework-areas-serializer');
const frameworkSerializer = require('../../infrastructure/serializers/jsonapi/framework-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async getPixFramework(request, h) {
    const locale = extractLocaleFromRequest(request);
    const framework = await usecases.getPixFramework(locale);
    return h.response(frameworkAreasSerializer.serialize(framework)).code(200);
  },
  async getFrameworks(request, h) {
    const frameworks = await usecases.getFrameworks();
    const serializedFrameworks = frameworkSerializer.serialize(frameworks);
    return h.response(serializedFrameworks).code(200);
  },
  async getFrameworkAreas(request, h) {
    const frameworkId = request.params.id;
    const framework = await usecases.getFrameworkAreas({ frameworkId });
    return h.response(frameworkAreasSerializer.serialize(framework)).code(200);
  },
};
