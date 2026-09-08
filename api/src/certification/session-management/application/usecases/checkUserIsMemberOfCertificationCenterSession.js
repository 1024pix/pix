import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as sessionRepository from '../../infrastructure/repositories/session-management-repository.js';

export async function execute({
  userId,
  certificationCourseId,
  dependencies = { certificationCourseRepository, sessionRepository },
}) {
  const certificationCourse = await dependencies.certificationCourseRepository.get({ id: certificationCourseId });
  return dependencies.sessionRepository.doesUserHaveCertificationCenterMembershipForSession({
    userId,
    sessionId: certificationCourse.getSessionId(),
  });
}
