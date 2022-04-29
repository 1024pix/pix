const usecases = require('../../domain/usecases');
const frameworkAreasSerializer = require('../../infrastructure/serializers/jsonapi/framework-areas-serializer');
const frameworkSerializer = require('../../infrastructure/serializers/jsonapi/framework-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async getPixFramework(request) {
    const locale = extractLocaleFromRequest(request);
    const framework = await usecases.getFrameworkAreas({ frameworkName: 'Pix', locale });
    return frameworkAreasSerializer.serialize(framework);
  },
  async getFrameworks() {
    const frameworks = await usecases.getFrameworks();
    return frameworkSerializer.serialize(frameworks);
  },
  async getFrameworkAreas(request) {
    const frameworkId = request.params.id;
    const framework = await usecases.getFrameworkAreas({ frameworkId });
    return frameworkAreasSerializer.serialize(framework);
  },
};
