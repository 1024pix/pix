import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';

const execute = async function ({ userId, certificationCourseId, dependencies = { certificationCourseRepository } }) {
  const certificationCourse = await dependencies.certificationCourseRepository.get(certificationCourseId);
  return certificationCourse.doesBelongTo(userId);
};

export { execute };
