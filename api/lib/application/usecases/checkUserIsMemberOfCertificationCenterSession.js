import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as sessionRepository from '../../../src/certification/session/infrastructure/repositories/session-repository.js';

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
