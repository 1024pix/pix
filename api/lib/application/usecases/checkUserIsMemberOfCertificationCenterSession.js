import * as sessionRepository from '../../../src/certification/session-management/infrastructure/repositories/session-repository.js';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';

const execute = async function ({
  userId,
  certificationCourseId,
  dependencies = { certificationCourseRepository, sessionRepository },
}) {
  const certificationCourse = await dependencies.certificationCourseRepository.get({ id: certificationCourseId });
  return dependencies.sessionRepository.doesUserHaveCertificationCenterMembershipForSession({
    userId,
    sessionId: certificationCourse.getSessionId(),
  });
};

export { execute };
