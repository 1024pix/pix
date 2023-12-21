import { V3CertificationCourseDetailsForAdministration } from '../../../../src/certification/course/domain/models/V3CertificationCourseDetailsForAdministration.js';

export const buildV3CertificationCourseDetailsForAdministration = ({
  certificationCourseId,
  certificationChallengesForAdministration = [],
}) => {
  return new V3CertificationCourseDetailsForAdministration({
    certificationCourseId,
    certificationChallengesForAdministration,
  });
};
