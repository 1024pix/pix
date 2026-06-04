import * as organizationApi from '../../../organizational-entities/application/api/organization-api.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';

export async function hasAccessToCombinedCourse({
  userId,
  code,
  combinedCourseRepository,
  organizationFeatureRepository,
  combinedCourseParticipantRepository,
}) {
  const { organizationId } = await combinedCourseRepository.getByCode({ code });
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
}
