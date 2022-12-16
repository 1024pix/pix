const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository');

module.exports = {
  async execute({ userId, certificationCourseId }) {
    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
    return sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
      userId,
      certificationCourse.getSessionId()
    );
  },
};
