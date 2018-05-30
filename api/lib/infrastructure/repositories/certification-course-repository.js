const CertificationCourseBookshelf = require('../data/certification-course');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(model) {
  return new CertificationCourse({
    id: model.get('id'),
    userId: model.get('userId'),
    type: Assessment.types.CERTIFICATION,
    assessment: model.related('assessment').toJSON(),
    challenges: model.related('challenges').toJSON(),
    createdAt: model.get('createdAt'),
    completedAt: model.get('completedAt'),
    firstName: model.get('firstName'),
    lastName: model.get('lastName'),
    birthplace: model.get('birthplace'),
    birthdate: model.get('birthdate'),
    sessionId: model.get('sessionId'),
    externalId: model.get('externalId')
  });
}

module.exports = {

  save(certificationCourseDomainModel) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseDomainModel);
    return certificationCourseBookshelf.save()
      .then(_toDomain);
  },

  changeCompletionDate(certificationCourseId, completedAt = null) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({ id: certificationCourseId, completedAt });
    return certificationCourseBookshelf.save();
  },

  get(id) {
    return CertificationCourseBookshelf
      .where({ id })
      .fetch({ require: true, withRelated: ['assessment', 'challenges'] })
      .then(_toDomain)
      .catch(bookshelfError => {
        if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
          return Promise.reject(new NotFoundError());
        }
        return Promise.reject(bookshelfError);
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
