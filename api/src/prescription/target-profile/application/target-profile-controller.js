import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as frameworkwithoutskillserializer from '../infrastructure/serializers/jsonapi/framework-without-skills-serializer.js';
import * as targetProfileForSpecifierSerializer from '../infrastructure/serializers/jsonapi/target-profile-for-specifier-serializer.js';

const findTargetProfiles = async function (request, h, dependencies = { targetProfileForSpecifierSerializer }) {
  const organizationId = request.params.id;
  const targetProfiles = await usecases.getAvailableTargetProfilesForOrganization({ organizationId });
  return dependencies.targetProfileForSpecifierSerializer.serialize(targetProfiles);
};

const getFrameworksForTargetProfileSubmission = async function (
  request,
  _,
  dependencies = { extractLocaleFromRequest, frameworkwithoutskillserializer },
) {
  const locale = dependencies.extractLocaleFromRequest(request);
  const learningContent = await usecases.getLearningContentForTargetProfileSubmission({ locale });
  return dependencies.frameworkwithoutskillserializer.serialize(learningContent.frameworks);
};

const targetProfileController = {
  getFrameworksForTargetProfileSubmission,
  findTargetProfiles,
};

export { targetProfileController };
