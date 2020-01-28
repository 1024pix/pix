const { _ } = require('lodash');

const CertificationCourseBookshelf = require('../data/certification-course');
const AssessmentBookshelf = require('../data/assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  save(certificationCourse) {
    return new CertificationCourseBookshelf(_adaptModelToDb(certificationCourse))
      .save()
      .then(_toDomain);
  },

  changeCompletionDate(certificationCourseId, completedAt = null) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({ id: certificationCourseId, completedAt });
    return certificationCourseBookshelf
      .save()
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
      .fetch({ require: true, withRelated: ['assessments', 'challenges'] })
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
    return certificationCourseBookshelf
      .save()
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
          return Promise.reject(new NotFoundError());
        }
        return Promise.reject(err);
      });
  },

  async findIdsBySessionId(sessionId) {
    const result = await CertificationCourseBookshelf
      .where({ sessionId })
      .orderBy('createdAt', 'desc')
      .fetchAll({ columns: ['id'] });

    return _.map(result.models, 'id');
  },

};

function _toDomain(bookshelfCertificationCourse) {
  if (!bookshelfCertificationCourse) {
    return null;
  }

  const assessments = bookshelfToDomainConverter.buildDomainObjects(AssessmentBookshelf, bookshelfCertificationCourse.related('assessments'));
  const assessment = _selectPreferablyLastCompletedAssessmentOrAnyLastAssessmentOrUndefined(assessments);
  const dbCertificationCourse = bookshelfCertificationCourse.toJSON();
  return new CertificationCourse({
    type: Assessment.types.CERTIFICATION,
    assessment,
    challenges: bookshelfCertificationCourse.related('challenges').toJSON(),
    ..._.pick(dbCertificationCourse, [
      'id',
      'userId',
      'createdAt',
      'completedAt',
      'firstName',
      'lastName',
      'birthplace',
      'birthdate',
      'sessionId',
      'externalId',
      'isPublished',
      'isV2Certification',
    ]),
  });
}

function _adaptModelToDb(certificationCourse) {
  return _.omit(certificationCourse, [
    'assessment',
    'challenges',
    'createdAt',
  ]);
}

function _selectPreferablyLastCompletedAssessmentOrAnyLastAssessmentOrUndefined(assessments) {
  const creationDateOrderedAssessments = _.orderBy(assessments, ['createdAt'], ['desc']);
  const completedAssessment = _.find(creationDateOrderedAssessments, { 'state': Assessment.states.COMPLETED });

  return completedAssessment ? completedAssessment : _.head(creationDateOrderedAssessments);
}
