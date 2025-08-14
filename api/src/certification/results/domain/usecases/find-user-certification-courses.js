import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js'; /**
 * @param {Object} params
 * @param {number} params.userId
 * @param {import('./index.js').certificationCourseRepository} params.certificationCourseRepository
 **/
const findUserCertificationCourses = async function ({
  userId,
  certificationCourseRepository = injectedCertificationCourseRepository,
} = {}) {
  return certificationCourseRepository.findAllByUserId({ userId });
};

export { findUserCertificationCourses };
