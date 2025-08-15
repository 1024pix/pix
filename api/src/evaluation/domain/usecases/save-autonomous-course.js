import * as injectedTargetProfileAdministrationRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import * as injectedTargetProfileRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import { constants } from '../../../shared/domain/constants.js';
import {
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  NotFoundError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
} from '../../../shared/domain/errors.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

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
  autonomousCourseRepository = injectedRepositories.autonomousCourseRepository,
  targetProfileRepository = injectedTargetProfileRepository,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) => {
  let targetProfile;

  try {
    targetProfile = await targetProfileAdministrationRepository.get({ id: autonomousCourse.targetProfileId });
  } catch {
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
