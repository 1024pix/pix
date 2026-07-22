import { config } from '../../../shared/config.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AutonomousCourseTargetProfile } from '../../domain/models/AutonomousCourseTargetProfile.js';

function _toDomain(AutonomousCourseTargetProfileDTO) {
  return AutonomousCourseTargetProfileDTO.map(
    (autonomousCourseTargetProfile) => new AutonomousCourseTargetProfile(autonomousCourseTargetProfile),
  );
}

export async function get({ targetProfileApi }) {
  const targetProfiles = await targetProfileApi.getByOrganizationId(
    config.autonomousCourse.autonomousCoursesOrganizationId,
  );

  const autonomousCourseTargetProfileDTO = targetProfiles.filter((targetProfile) => targetProfile.isSimplifiedAccess);

  if (!autonomousCourseTargetProfileDTO.length) {
    throw new NotFoundError(
      `No autonomous-courses target-profile found for organization ${config.autonomousCourse.autonomousCoursesOrganizationId}`,
    );
  }

  return _toDomain(autonomousCourseTargetProfileDTO);
}
