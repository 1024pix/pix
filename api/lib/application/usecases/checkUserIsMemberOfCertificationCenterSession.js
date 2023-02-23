const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository.js');

module.exports = {
  async execute({ userId, certificationCourseId }) {
    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
    return sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
      userId,
      certificationCourse.getSessionId()
    );
  },
};
