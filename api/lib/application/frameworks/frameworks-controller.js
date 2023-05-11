import { usecases } from '../../domain/usecases/index.js';
import * as frameworkAreasSerializer from '../../infrastructure/serializers/jsonapi/framework-areas-serializer.js';
import * as frameworkSerializer from '../../infrastructure/serializers/jsonapi/framework-serializer.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const getFrameworks = async function (request, h, dependencies = { frameworkSerializer }) {
  const frameworks = await usecases.getFrameworks();
  return dependencies.frameworkSerializer.serialize(frameworks);
};

const getFrameworkAreas = async function (request, h, dependencies = { frameworkAreasSerializer }) {
  const frameworkId = request.params.id;
  const framework = await usecases.getFrameworkAreas({ frameworkId });
  return dependencies.frameworkAreasSerializer.serialize(framework);
};

const getPixFrameworkAreasWithoutThematics = async function (
  request,
  h,
  dependencies = { extractLocaleFromRequest, frameworkAreasSerializer }
) {
  const locale = dependencies.extractLocaleFromRequest(request);
  const framework = await usecases.getFrameworkAreas({ frameworkName: 'Pix', locale });
  return dependencies.frameworkAreasSerializer.serialize(framework, { withoutThematics: true });
};

const getFrameworksForTargetProfileSubmission = async function (
  request,
  h,
  dependencies = { extractLocaleFromRequest, frameworkSerializer }
) {
  const locale = dependencies.extractLocaleFromRequest(request);
  const learningContent = await usecases.getLearningContentForTargetProfileSubmission({ locale });
  return dependencies.frameworkSerializer.serializeDeepWithoutSkills(learningContent.frameworks);
};

const frameworksController = {
  getFrameworks,
  getFrameworkAreas,
  getPixFrameworkAreasWithoutThematics,
  getFrameworksForTargetProfileSubmission,
};

export { frameworksController };
