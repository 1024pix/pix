const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../lib/domain/errors');
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
  },

  findCertificationsByUserId(userId) {
    return Promise.resolve([]);
  },

  updateCertification({ id, attributes }) {
    return CertificationCourseBookshelf
      .where({ id })
      .save(attributes, {
        patch: true,
        method: 'update',
        require: true
      })
      .catch(err => {
        if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
          throw new NotFoundError(`Not found certification for ID ${id}`);
        } else {
          throw err;
        }
      });
  }
};
