const Certification = require('../../../lib/domain/models/Certification');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');

module.exports = {

  findCompletedCertificationsByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetchAll({ withRelated: ['session', 'assessment'] })
      .then((certificationCoursesBookshelf) => {

        const certifications = [];

        certificationCoursesBookshelf.forEach((certificationCourseBookshelf) => {
          if (certificationCourseBookshelf.related('assessment').get('state') !== 'completed') {
            return;
          }

          const certification = new Certification({
            id: certificationCourseBookshelf.get('id'),
            date: certificationCourseBookshelf.get('completedAt'),
            certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter')
          });

          certifications.push(certification);
        });

        return Promise.resolve(certifications);
      });
  }
};
