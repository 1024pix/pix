const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository.js');

module.exports = {
  async execute({
    userId,
    certificationCourseId,
    dependencies = { certificationCourseRepository, sessionRepository },
  }) {
    const certificationCourse = await dependencies.certificationCourseRepository.get(certificationCourseId);
    return dependencies.sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
      userId,
      certificationCourse.getSessionId()
    );
  },
};
