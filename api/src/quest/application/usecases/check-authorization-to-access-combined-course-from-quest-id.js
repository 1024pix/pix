import * as organizationApi from '../../../../src/organizational-entities/application/api/organization-api.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import * as organizationFeatureRepository from '../../../shared/infrastructure/repositories/organization-feature-repository.js';
import * as combinedCourseParticipantRepository from '../../infrastructure/repositories/combined-course-participant-repository.js';
import * as combinedCourseRepository from '../../infrastructure/repositories/combined-course-repository.js';

const execute = async function ({ userId, questId }) {
  const { organizationId } = await combinedCourseRepository.getById({ id: questId });

  const hasImportFeature = await organizationFeatureRepository.isFeatureEnabledForOrganization({
    organizationId,
    featureKey: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
  });

  const organization = await organizationApi.getOrganization(organizationId);

  if (!hasImportFeature && !organization.isManagingStudents) {
    return true;
  }

  const organizationLearner = await combinedCourseParticipantRepository.findOrganizationLearner({
    userId,
    organizationId,
  });
  return Boolean(organizationLearner);
};

export { execute };
