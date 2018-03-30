const CertificationCourseBookshelf = require('../data/certification-course');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(model) {
  return new CertificationCourse({
    //TODO: 1088 modify rejectionReason in assessment-result and not in certifCourse anymore
    id: model.get('id'),
    userId: model.get('userId'),
    status: model.get('status'),
    type: 'CERTIFICATION',
    assessment: model.related('assessment').toJSON(),
    challenges: model.related('challenges').toJSON(),
    createdAt: model.get('createdAt'),
    completedAt: model.get('completedAt'),
    firstName: model.get('firstName'),
    lastName: model.get('lastName'),
    birthplace: model.get('birthplace'),
    birthdate: model.get('birthdate'),
    rejectionReason: model.get('rejectionReason'),
    sessionId: model.get('sessionId')
  });
}

module.exports = {

  save(certificationCourseDomainModel) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseDomainModel);
    return certificationCourseBookshelf.save()
      .then(_toDomain);
  },

  updateStatus(status, certificationCourseId, completedAt = null) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({
      id: certificationCourseId,
      status,
      completedAt
    });
    return certificationCourseBookshelf.save();
  },

  get(id) {
    return CertificationCourseBookshelf
      .where({ id })
      .fetch({ require: true, withRelated: ['assessment', 'challenges'] })
      .then(_toDomain)
      .catch(() => {
        return Promise.reject(new NotFoundError());
      });
  },

  update(certificationCourse) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourse);
    return certificationCourseBookshelf.save()
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
          return Promise.reject(new NotFoundError());
        }
        return Promise.reject(err);
      });

  }

};
