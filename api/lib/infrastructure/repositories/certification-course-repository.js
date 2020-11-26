const { _ } = require('lodash');
const { knex } = require('../bookshelf');

const CertificationCourseBookshelf = require('../data/certification-course');
const AssessmentBookshelf = require('../data/assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');
const certificationChallengeRepository = require('./certification-challenge-repository');

module.exports = {

  async save({ certificationCourse, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const certificationCourseToSaveDTO = _adaptModelToDb(certificationCourse);
    const options = { transacting : domainTransaction.knexTransaction };
    const savedCertificationCourseDTO = await new CertificationCourseBookshelf(certificationCourseToSaveDTO).save(null, options);

    // FIXME : Save all challenges in a single DB request
    const savedChallenges = await Promise.all(certificationCourse.challenges.map((certificationChallenge) => {
      const certificationChallengeWithCourseId = { ...certificationChallenge, courseId: savedCertificationCourseDTO.id };
      return certificationChallengeRepository.save({ certificationChallenge: certificationChallengeWithCourseId, domainTransaction });
    }));

    const savedCertificationCourse = _toDomain(savedCertificationCourseDTO);
    savedCertificationCourse.challenges = savedChallenges;
    return savedCertificationCourse;
  },

  async changeCompletionDate(certificationCourseId, completedAt = null, domainTransaction = {}) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({ id: certificationCourseId, completedAt });
    const savedCertificationCourse = await certificationCourseBookshelf.save(null, { transacting: domainTransaction.knexTransaction });
    return _toDomain(savedCertificationCourse);
  },

  async get(id) {
    try {
      const certificationCourseBookshelf = await CertificationCourseBookshelf
        .where({ id })
        .fetch({ require: true, withRelated: ['assessment', 'challenges', 'certificationIssueReports'] });
      return bookshelfToDomainConverter.buildDomainObject(CertificationCourseBookshelf, certificationCourseBookshelf);
    } catch (bookshelfError) {
      if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
        throw new NotFoundError(`Certification course of id ${id} does not exist.`);
      }
      throw bookshelfError;
    }
  },

  async getCreationDate(id) {
    const row = await knex('certification-courses')
      .select('createdAt')
      .where({ id })
      .first();
    if (!row) {
      throw new NotFoundError(`Certification course of id ${id} does not exist.`);
    }

    return row.createdAt;
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

  async isVerificationCodeAvailable(verificationCode) {
    const exist = await knex('certification-courses')
      .select('id')
      .whereRaw('UPPER(??)=?', ['verificationCode', verificationCode.toUpperCase()])
      .first();

    return !exist;
  },

  async findCertificationCoursesBySessionId({ sessionId }) {
    const bookshelfCertificationCourses = await CertificationCourseBookshelf
      .where({ sessionId })
      .fetchAll();
    return bookshelfToDomainConverter.buildDomainObjects(CertificationCourseBookshelf, bookshelfCertificationCourses);
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
    'certificationIssueReports',
    'assessment',
    'challenges',
    'createdAt',
  ]);
}
