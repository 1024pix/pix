import { NotFoundError } from '../../../shared/domain/errors.js';
import {
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
} from '../errors.js';
import { constants } from '../../../../lib/domain/constants.js';

/**
 * @param {AutonomousCourse} autonomousCourse
 * @param autonomousCourseRepository
 * @param targetProfileRepository
 * @param targetProfileForAdminRepository
 * @returns {Promise<*>}
 */
const saveAutonomousCourse = async ({
  autonomousCourse,
  autonomousCourseRepository,
  targetProfileRepository,
  targetProfileForAdminRepository,
}) => {
  let targetProfile;

  try {
    targetProfile = await targetProfileForAdminRepository.get({ id: autonomousCourse.targetProfileId });
  } catch (e) {
    throw new NotFoundError(`No target profile found for ID ${autonomousCourse.targetProfileId}`);
  }

  const organizationIds = await targetProfileRepository.findOrganizationIds(autonomousCourse.targetProfileId);

  if (![...organizationIds, targetProfile.ownerOrganizationId].includes(constants.AUTONOMOUS_COURSES_ORGANIZATION_ID)) {
    throw new TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization();
  }

  if (!targetProfile.isSimplifiedAccess) {
    throw new AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError();
  }

  return autonomousCourseRepository.save({ autonomousCourse });
};

export { saveAutonomousCourse };
