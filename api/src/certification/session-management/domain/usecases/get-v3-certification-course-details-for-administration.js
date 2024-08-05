export const getV3CertificationCourseDetailsForAdministration = async ({
  certificationCourseId,
  competenceRepository,
  v3CertificationCourseDetailsForAdministrationRepository,
}) => {
  const competences = await competenceRepository.list();

  const courseDetails =
    await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
      certificationCourseId,
    });

  courseDetails.setCompetencesDetails(competences);

  return courseDetails;
};
