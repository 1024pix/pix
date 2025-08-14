import * as injectedCertificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
const getCertificationCourse = async function ({
  certificationCourseId,
  certificationCourseRepository = injectedCertificationCourseRepository,
} = {}) {
  return certificationCourseRepository.get({ id: certificationCourseId });
};

export { getCertificationCourse };
