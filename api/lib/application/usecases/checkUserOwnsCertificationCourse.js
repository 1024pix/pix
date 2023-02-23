const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');

module.exports = {
  async execute({ userId, certificationCourseId }) {
    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
    return certificationCourse.doesBelongTo(userId);
  },
};
