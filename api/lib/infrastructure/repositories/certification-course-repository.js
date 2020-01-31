const { _ } = require('lodash');

const CertificationCourseBookshelf = require('../data/certification-course');
const AssessmentBookshelf = require('../data/assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  async save(certificationCourse) {
    const certificationCourseToSave = _adaptModelToDb(certificationCourse);
    const savedCertificationCourse = await new CertificationCourseBookshelf(certificationCourseToSave).save();
    return _toDomain(savedCertificationCourse);
  },

  async changeCompletionDate(certificationCourseId, completedAt = null) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({ id: certificationCourseId, completedAt });
    const savedCertificationCourse = await certificationCourseBookshelf.save();
    return _toDomain(savedCertificationCourse);
  },

  async get(id) {
    try {
      const certificationCourse = await CertificationCourseBookshelf
        .where({ id })
        .fetch({ require: true, withRelated: ['assessments', 'challenges'] });
      return _toDomain(certificationCourse);
    } catch (bookshelfError) {
      if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
        throw new NotFoundError(`Certification course of id ${id} does not exist.`);
      }
      throw bookshelfError;
    }
  },

  async getLastCertificationCourseByUserIdAndSessionId(userId, sessionId) {
    try {
      const certificationCourse = await CertificationCourseBookshelf
        .where({ userId, sessionId })
        .orderBy('createdAt', 'desc')
        .query((qb) => qb.limit(1))
        .fetch({ require: true, withRelated: ['assessments', 'challenges'] });
      return _toDomain(certificationCourse);
    } catch (err) {
      if (err instanceof CertificationCourseBookshelf.NotFoundError) {
        throw new NotFoundError(`Certification course with userId ${userId} and sessionId ${sessionId} does not exist.`);
      }
      throw err;
    }
  },

  async update(certificationCourse) {
    const certificationCourseData = _adaptModelToDb(certificationCourse);
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseData);
    try {
      const certificationCourse = await certificationCourseBookshelf.save();
      return _toDomain(certificationCourse);
    } catch (err) {
      if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
        throw new NotFoundError(`No rows updated for certification course of id ${certificationCourse.id}.`);
      }
      throw err;
    }
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
