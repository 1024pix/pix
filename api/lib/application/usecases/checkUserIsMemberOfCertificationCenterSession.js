import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as sessionRepository from '../../infrastructure/repositories/sessions/session-repository.js';

const execute = async function ({
  userId,
  certificationCourseId,
  dependencies = { certificationCourseRepository, sessionRepository },
}) {
  const certificationCourse = await dependencies.certificationCourseRepository.get(certificationCourseId);
  return dependencies.sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
    userId,
    certificationCourse.getSessionId(),
  );
};

export { execute };
