const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

module.exports = {

  update(certificationCourse) {
    return certificationCourseRepository.update(certificationCourse);
  }
};
