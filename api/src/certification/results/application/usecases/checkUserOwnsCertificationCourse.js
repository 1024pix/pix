import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';

export async function execute({ userId, certificationCourseId, dependencies = { certificationCourseRepository } }) {
  const certificationCourse = await dependencies.certificationCourseRepository.get({ id: certificationCourseId });
  return certificationCourse.getUserId() === userId;
}
