const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');

module.exports = {
  async execute({ userId, certificationCourseId, dependencies = { certificationCourseRepository } }) {
    const certificationCourse = await dependencies.certificationCourseRepository.get(certificationCourseId);
    return certificationCourse.doesBelongTo(userId);
  },
};
