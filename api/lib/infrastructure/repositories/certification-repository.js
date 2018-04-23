const Certification = require('../../../lib/domain/models/Certification');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');

module.exports = {

  findByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetchAll({ withRelated: ['session', 'assessment'] })
      .then((certificationCoursesBookshelf) => {

        if (!certificationCoursesBookshelf) {
          return [];
        }

        const certifications = [];

        certificationCoursesBookshelf.map((certificationCourseBookshelf) => {
          if (certificationCourseBookshelf.related('assessment').get('state') === 'completed') {
            certifications.push(new Certification({
              id: certificationCourseBookshelf.get('id'),
              date: certificationCourseBookshelf.get('completedAt'),
              certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter')
            }));
          }
        });

        return Promise.resolve(certifications);
      });
  }
};
