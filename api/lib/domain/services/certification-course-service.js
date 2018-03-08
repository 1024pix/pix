const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = {

  update(certificationCourse) {
    return certificationCourseRepository.update(certificationCourse)
      .catch((error) => {
        if (error instanceof NotFoundError) {
          return Promise.reject(error);
        }
        return Promise.reject(error);
      });
  }
};
