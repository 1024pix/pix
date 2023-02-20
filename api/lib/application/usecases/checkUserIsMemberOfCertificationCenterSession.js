import certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository';
import sessionRepository from '../../infrastructure/repositories/sessions/session-repository';

export default {
  async execute({ userId, certificationCourseId }) {
    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
    return sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
      userId,
      certificationCourse.getSessionId()
    );
  },
};
