import { AUTONOMOUS_COURSES_ORGANIZATION_ID } from '../../../shared/constants.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AutonomousCourseTargetProfile } from '../../domain/models/AutonomousCourseTargetProfile.js';

function _toDomain(AutonomousCourseTargetProfileDTO) {
  return AutonomousCourseTargetProfileDTO.map(
    (autonomousCourseTargetProfile) => new AutonomousCourseTargetProfile(autonomousCourseTargetProfile),
  );
}

const get = async function ({ targetProfileApi }) {
  const targetProfiles = await targetProfileApi.getByOrganizationId(AUTONOMOUS_COURSES_ORGANIZATION_ID);

  const autonomousCourseTargetProfileDTO = targetProfiles.filter((targetProfile) => targetProfile.isSimplifiedAccess);

  if (!autonomousCourseTargetProfileDTO.length) {
    throw new NotFoundError(
      `No autonomous-courses target-profile found for organization ${AUTONOMOUS_COURSES_ORGANIZATION_ID}`,
    );
  }

  return _toDomain(autonomousCourseTargetProfileDTO);
};

export { get };
