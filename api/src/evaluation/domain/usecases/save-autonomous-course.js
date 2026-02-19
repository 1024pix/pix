import { constants } from '../../../shared/domain/constants.js';
import {
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  NotFoundError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
} from '../../../shared/domain/errors.js';

/**
 * @param {AutonomousCourse} autonomousCourse
 * @param autonomousCourseRepository
 * @param targetProfileRepository
 * @param targetProfileAdministrationRepository
 *
 * @returns {Promise<*>}
 */
const saveAutonomousCourse = async ({
  autonomousCourse,
  autonomousCourseRepository,
  targetProfileRepository,
  targetProfileAdministrationRepository,
}) => {
  let targetProfile;

  try {
    targetProfile = await targetProfileAdministrationRepository.get({ id: autonomousCourse.targetProfileId });
  } catch {
    throw new NotFoundError(`No target profile found for ID ${autonomousCourse.targetProfileId}`);
  }

  const organizationIds = await targetProfileRepository.findOrganizationIds(autonomousCourse.targetProfileId);

  if (!organizationIds.includes(constants.AUTONOMOUS_COURSES_ORGANIZATION_ID)) {
    throw new TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization();
  }

  if (!targetProfile.isSimplifiedAccess) {
    throw new AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError();
  }

  return autonomousCourseRepository.save({ autonomousCourse });
};

export { saveAutonomousCourse };
