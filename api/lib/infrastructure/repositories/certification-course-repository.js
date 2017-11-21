const CertificationCourse = require('../../domain/models/data/certification-course');

module.exports = {

  save() {
    const certificationCourse = new CertificationCourse();
    return certificationCourse.save()
      .then((savedCertificationCourse) => {
        return savedCertificationCourse.toJSON();
      });
  }
};
