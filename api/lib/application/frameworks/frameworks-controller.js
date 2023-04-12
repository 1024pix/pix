const usecases = require('../../domain/usecases/index.js');
const frameworkAreasSerializer = require('../../infrastructure/serializers/jsonapi/framework-areas-serializer.js');
const frameworkSerializer = require('../../infrastructure/serializers/jsonapi/framework-serializer.js');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  async getFrameworks(request, h, dependencies = { frameworkSerializer }) {
    const frameworks = await usecases.getFrameworks();
    return dependencies.frameworkSerializer.serialize(frameworks);
  },

  async getFrameworkAreas(request, h, dependencies = { frameworkAreasSerializer }) {
    const frameworkId = request.params.id;
    const framework = await usecases.getFrameworkAreas({ frameworkId });
    return dependencies.frameworkAreasSerializer.serialize(framework);
  },

  async getPixFrameworkAreasWithoutThematics(
    request,
    h,
    dependencies = { extractLocaleFromRequest, frameworkAreasSerializer }
  ) {
    const locale = dependencies.extractLocaleFromRequest(request);
    const framework = await usecases.getFrameworkAreas({ frameworkName: 'Pix', locale });
    return dependencies.frameworkAreasSerializer.serialize(framework, { withoutThematics: true });
  },

  async getFrameworksForTargetProfileSubmission(
    request,
    h,
    dependencies = { extractLocaleFromRequest, frameworkSerializer }
  ) {
    const locale = dependencies.extractLocaleFromRequest(request);
    const learningContent = await usecases.getLearningContentForTargetProfileSubmission({ locale });
    return dependencies.frameworkSerializer.serializeDeepWithoutSkills(learningContent.frameworks);
  },
};
