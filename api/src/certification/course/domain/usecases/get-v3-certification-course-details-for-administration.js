export const getV3CertificationCourseDetailsForAdministration = ({
  certificationCourseId,
  v3CertificationCourseDetailsForAdministrationRepository,
}) => {
  return v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
    certificationCourseId,
  });
};
