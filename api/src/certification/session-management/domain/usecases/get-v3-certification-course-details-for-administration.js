export async function getV3CertificationCourseDetailsForAdministration({
  certificationCourseId,
  competenceRepository,
  v3CertificationCourseDetailsForAdministrationRepository,
  versionApi,
}) {
  const competences = await competenceRepository.list();

  const courseDetails =
    await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
      certificationCourseId,
    });

  const version = await versionApi.getById({ id: courseDetails.versionId });

  courseDetails.numberOfChallenges = version.challengesConfiguration.maximumAssessmentLength;

  courseDetails.setCompetencesDetails(competences);

  return courseDetails;
}
