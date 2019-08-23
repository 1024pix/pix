const { _ } = require('lodash');

const CertificationCourseBookshelf = require('../data/certification-course');
const Assessment = require('../../domain/models/Assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfCertificationCourse) {
  if (bookshelfCertificationCourse) {
    const certificationCourse = bookshelfToDomainConverter.buildDomainObject(CertificationCourseBookshelf, bookshelfCertificationCourse);
    certificationCourse.isPublished = Boolean(certificationCourse.isPublished);
    certificationCourse.isV2Certification = Boolean(certificationCourse.isV2Certification);
    certificationCourse.type = Assessment.types.CERTIFICATION;
    certificationCourse.assessment = bookshelfCertificationCourse.related('assessment').toJSON();
    certificationCourse.challenges = bookshelfCertificationCourse.related('challenges').toJSON();
    return certificationCourse;
  }
  return null;
}

module.exports = {

  //TODO omit number of course, add it to domain (length of related certificationChallenge array)
  save(certificationCourseDomainModel) {
    const certificationCourseData = _adaptModelToDb(certificationCourseDomainModel);
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseData);
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
      .catch((bookshelfError) => {
        if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
          return Promise.reject(new NotFoundError());
        }
        return Promise.reject(bookshelfError);
      });
  },

  findLastCertificationCourseByUserIdAndSessionId(userId, sessionId) {
    return CertificationCourseBookshelf
      .where({ userId, sessionId })
      .orderBy('createdAt', 'desc')
      .query((qb) => qb.limit(1))
      .fetchAll()
      .then((certificationCourses) => certificationCourses.map(_toDomain));
  },

  update(certificationCourse) {
    const certificationCourseData = _adaptModelToDb(certificationCourse);
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseData);
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

function _adaptModelToDb(certificationCourse) {
  return _.omit(certificationCourse, [
    'nbChallenges',
    'createdAt',
  ]);
}
