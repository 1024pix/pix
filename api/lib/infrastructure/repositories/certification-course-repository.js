const { _ } = require('lodash');

const CertificationCourseBookshelf = require('../data/certification-course');
const AssessmentBookshelf = require('../data/assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(model) {
  if (model) {
    const assessments = bookshelfToDomainConverter.buildDomainObjects(AssessmentBookshelf, model.related('assessments'));
    const assessment = assessments.length > 0 ? assessments[0] : undefined;
    return CertificationCourse.fromAttributes({
      id: model.get('id'),
      userId: model.get('userId'),
      type: Assessment.types.CERTIFICATION,
      assessment,
      challenges: model.related('challenges').toJSON(),
      createdAt: model.get('createdAt'),
      completedAt: model.get('completedAt'),
      firstName: model.get('firstName'),
      lastName: model.get('lastName'),
      birthplace: model.get('birthplace'),
      birthdate: model.get('birthdate'),
      sessionId: model.get('sessionId'),
      externalId: model.get('externalId'),
      isPublished: Boolean(model.get('isPublished')),
      isV2Certification: Boolean(model.get('isV2Certification')),
    });
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
    return certificationCourseBookshelf.save()
      .then(_toDomain);
  },

  get(id) {
    return CertificationCourseBookshelf
      .where({ id })
      .fetch({ require: true, withRelated: ['assessments', 'challenges'] })
      .then(_toDomain)
      .catch((bookshelfError) => {
        if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
          return Promise.reject(new NotFoundError());
        }
        return Promise.reject(bookshelfError);
      });
  },

  getLastCertificationCourseByUserIdAndSessionId(userId, sessionId) {
    return CertificationCourseBookshelf
      .where({ userId, sessionId })
      .orderBy('createdAt', 'desc')
      .query((qb) => qb.limit(1))
      .fetch({ require: true })
      .then(_toDomain)
      .catch((error) => {
        if (error instanceof CertificationCourseBookshelf.NotFoundError) {
          throw new NotFoundError();
        }
        throw error;
      });
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
