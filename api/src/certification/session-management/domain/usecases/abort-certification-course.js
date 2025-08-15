import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';

const abortCertificationCourse = async function(
  {
    certificationCourseRepository = injectedCertificationCourseRepository,
    certificationCourseId,
    abortReason,
  } = {},
) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.abort(abortReason);
  await certificationCourseRepository.update({ certificationCourse });
};

export { abortCertificationCourse };
