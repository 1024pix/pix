const Certification = require('../../../lib/domain/models/Certification');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');

module.exports = {

  findByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetch({ withRelated: ['session'] })
      .then((certificationCourseBookshelf) => {

        if(!certificationCourseBookshelf) {
          return [];
        }

        return Promise.resolve([new Certification({
          date: certificationCourseBookshelf.get('completedAt'),
          certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter')
        })]);
      });
  }
};
