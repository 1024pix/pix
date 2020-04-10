const { _ } = require('lodash');

const CertificationCourseBookshelf = require('../data/certification-course');
const AssessmentBookshelf = require('../data/assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  async save({ certificationCourse, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const certificationCourseToSave = _adaptModelToDb(certificationCourse);
    const options = { transacting : domainTransaction.knexTransaction };
    const savedCertificationCourse = await new CertificationCourseBookshelf(certificationCourseToSave).save(null, options);
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
        .fetch({ require: true, withRelated: ['assessment', 'challenges', 'acquiredPartnerCertifications'] });
      return _toDomain(certificationCourse);
    } catch (bookshelfError) {
      if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
        throw new NotFoundError(`Certification course of id ${id} does not exist.`);
      }
      throw bookshelfError;
    }
  },

  async findOneCertificationCourseByUserIdAndSessionId({ userId, sessionId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const certificationCourse = await CertificationCourseBookshelf
      .where({ userId, sessionId })
      .orderBy('createdAt', 'desc')
      .fetch({ withRelated: ['assessment', 'challenges'], transacting: domainTransaction.knexTransaction });
    return _toDomain(certificationCourse);
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

  const assessment = bookshelfToDomainConverter.buildDomainObject(AssessmentBookshelf, bookshelfCertificationCourse.related('assessment'));
  const dbCertificationCourse = bookshelfCertificationCourse.toJSON();
  return new CertificationCourse({
    type: Assessment.types.CERTIFICATION,
    assessment,
    challenges: bookshelfCertificationCourse.related('challenges').toJSON(),
    acquiredPartnerCertifications: bookshelfCertificationCourse.related('acquiredPartnerCertifications').toJSON(),
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
      'examinerComment',
      'hasSeenEndTestScreen',
    ]),
  });
}

function _adaptModelToDb(certificationCourse) {
  return _.omit(certificationCourse, [
    'assessment',
    'challenges',
    'acquiredPartnerCertifications',
    'createdAt',
  ]);
}
