const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

module.exports = {
  async execute({ userId, certificationCourseId }) {
    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
    return certificationCourse.doesBelongTo(userId);
  },
};
