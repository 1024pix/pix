import { constants } from '../../../../lib/domain/constants.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { AutonomousCourseTargetProfile } from '../../domain/models/AutonomousCourseTargetProfile.js';

function _toDomain(AutonomousCourseTargetProfileDTO) {
  return AutonomousCourseTargetProfileDTO.map(
    (autonomousCourseTargetProfile) => new AutonomousCourseTargetProfile(autonomousCourseTargetProfile),
  );
}

const get = async function ({ targetProfileApi }) {
  const autonomousCourseTargetProfileDTO = await targetProfileApi.getByOrganizationId(
    constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
  );

  if (!autonomousCourseTargetProfileDTO.length) {
    throw new NotFoundError(
      `No autonomous-courses target-profile found for organization ${constants.AUTONOMOUS_COURSES_ORGANIZATION_ID}`,
    );
  }

  return _toDomain(autonomousCourseTargetProfileDTO);
};

export { get };
