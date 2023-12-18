import { V3CertificationCourseDetailsForAdministration } from '../models/V3CertificationCourseDetailsForAdministration.js';

export const getV3CertificationCourseDetailsForAdministration = ({ certificationCourseId }) => {
  return new V3CertificationCourseDetailsForAdministration({
    certificationCourseId,
  });
};
