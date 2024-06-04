import { extractLocaleFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as frameworkAreasSerializer from '../../infrastructure/serializers/jsonapi/framework-areas-serializer.js';
import * as frameworkSerializer from '../../infrastructure/serializers/jsonapi/framework-serializer.js';

const getFrameworks = async function (request, h, dependencies = { frameworkSerializer }) {
  const frameworks = await usecases.getFrameworks();
  return dependencies.frameworkSerializer.serialize(frameworks);
};

const getFrameworkAreas = async function (request, h, dependencies = { frameworkAreasSerializer }) {
  const frameworkId = request.params.id;
  const areas = await usecases.getFrameworkAreas({ frameworkId });
  return dependencies.frameworkAreasSerializer.serialize(areas);
};

const getPixFrameworkAreasWithoutThematics = async function (
  request,
  h,
  dependencies = { extractLocaleFromRequest, frameworkAreasSerializer },
) {
  const locale = dependencies.extractLocaleFromRequest(request);
  const areas = await usecases.getFrameworkAreas({ frameworkName: 'Pix', locale });
  return dependencies.frameworkAreasSerializer.serialize(areas, { withoutThematics: true });
};

const getFrameworksForTargetProfileSubmission = async function (
  request,
  h,
  dependencies = { extractLocaleFromRequest, frameworkSerializer },
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
