import * as injectedCompetenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as injectedV3CertificationCourseDetailsForAdministrationRepository from '../../infrastructure/repositories/v3-certification-course-details-for-administration-repository.js';

export const getV3CertificationCourseDetailsForAdministration = async ({
  certificationCourseId,
  competenceRepository = injectedCompetenceRepository,
  v3CertificationCourseDetailsForAdministrationRepository = injectedV3CertificationCourseDetailsForAdministrationRepository,
} = {}) => {
  const competences = await competenceRepository.list();

  const courseDetails =
    await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
      certificationCourseId,
    });

  courseDetails.setCompetencesDetails(competences);

  return courseDetails;
};
