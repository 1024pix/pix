const usecases = require('../../domain/usecases');
const frameworkSerializer = require('../../infrastructure/serializers/jsonapi/framework-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async getPixFramework(request, h) {
    const locale = extractLocaleFromRequest(request);
    const framework = await usecases.getPixFramework(locale);
    return h.response(frameworkSerializer.serialize(framework)).code(200);
  },
  async getFrameworks(request, h) {
    const frameworks = await usecases.getFrameworks();
    const serializedFrameworks = frameworks.map((framework) => frameworkSerializer.serialize(framework));
    return h.response(serializedFrameworks).code(200);
  },
};
