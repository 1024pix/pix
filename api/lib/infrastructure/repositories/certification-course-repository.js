const { _ } = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const bluebird = require('bluebird');
const CertificationCourseBookshelf = require('../orm-models/CertificationCourse');
const AssessmentBookshelf = require('../orm-models/Assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const { NotFoundError } = require('../../domain/errors');
const certificationChallengeRepository = require('./certification-challenge-repository');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const ComplementaryCertificationCourse = require('../../domain/models/ComplementaryCertificationCourse');
const Bookshelf = require('../bookshelf');

module.exports = {
  async save({ certificationCourse, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
    const certificationCourseToSaveDTO = _adaptModelToDb(certificationCourse);
    const options = { transacting: domainTransaction.knexTransaction };
    const savedCertificationCourseDTO = await new CertificationCourseBookshelf(certificationCourseToSaveDTO).save(
      null,
      options
    );

    const complementaryCertificationCourses = certificationCourse
      .toDTO()
      .complementaryCertificationCourses.map(({ complementaryCertificationId, complementaryCertificationBadgeId }) => ({
        complementaryCertificationId,
        complementaryCertificationBadgeId,
        certificationCourseId: savedCertificationCourseDTO.id,
      }));

    if (!_.isEmpty(complementaryCertificationCourses)) {
      await knexConn('complementary-certification-courses').insert(complementaryCertificationCourses);
    }

    const savedChallenges = await bluebird.mapSeries(
      certificationCourse.toDTO().challenges,
      (certificationChallenge) => {
        const certificationChallengeWithCourseId = {
          ...certificationChallenge,
          courseId: savedCertificationCourseDTO.id,
        };
        return certificationChallengeRepository.save({
          certificationChallenge: certificationChallengeWithCourseId,
          domainTransaction,
        });
      }
    );

    const savedCertificationCourse = toDomain(savedCertificationCourseDTO);
    savedCertificationCourse._challenges = savedChallenges;
    return savedCertificationCourse;
  },

  async changeCompletionDate(
    certificationCourseId,
    completedAt = null,
    domainTransaction = DomainTransaction.emptyTransaction()
  ) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({ id: certificationCourseId, completedAt });
    const savedCertificationCourse = await certificationCourseBookshelf.save(null, {
      transacting: domainTransaction.knexTransaction,
    });
    return toDomain(savedCertificationCourse);
  },

  async get(id) {
    try {
      const certificationCourseBookshelf = await CertificationCourseBookshelf.where({ id }).fetch({
        withRelated: ['assessment', 'challenges', 'certificationIssueReports', 'complementaryCertificationCourses'],
      });
      return toDomain(certificationCourseBookshelf);
    } catch (bookshelfError) {
      if (bookshelfError instanceof CertificationCourseBookshelf.NotFoundError) {
        throw new NotFoundError(`Certification course of id ${id} does not exist.`);
      }
      throw bookshelfError;
    }
  },

  async getCreationDate(id) {
    const row = await knex('certification-courses').select('createdAt').where({ id }).first();
    if (!row) {
      throw new NotFoundError(`Certification course of id ${id} does not exist.`);
    }

    return row.createdAt;
  },

  async findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const certificationCourse = await CertificationCourseBookshelf.where({ userId, sessionId })
      .orderBy('createdAt', 'desc')
      .fetch({
        require: false,
        withRelated: ['assessment', 'challenges'],
        transacting: domainTransaction.knexTransaction,
      });
    return toDomain(certificationCourse);
  },

  async update(certificationCourse) {
    const certificationCourseData = _pickUpdatableProperties(certificationCourse);
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseData);
    try {
      const certificationCourse = await certificationCourseBookshelf.save();
      return toDomain(certificationCourse);
    } catch (err) {
      if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
        throw new NotFoundError(`No rows updated for certification course of id ${certificationCourse.getId()}.`);
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
    const bookshelfCertificationCourses = await CertificationCourseBookshelf.where({ sessionId }).fetchAll();
    return bookshelfCertificationCourses.map(toDomain);
  },

  toDomain,
};

function toDomain(bookshelfCertificationCourse) {
  if (!bookshelfCertificationCourse) {
    return null;
  }

  const assessment = bookshelfToDomainConverter.buildDomainObject(
    AssessmentBookshelf,
    bookshelfCertificationCourse.related('assessment')
  );
  const dbCertificationCourse = bookshelfCertificationCourse.toJSON();
  return new CertificationCourse({
    assessment,
    challenges: bookshelfCertificationCourse.related('challenges').toJSON(),
    certificationIssueReports: bookshelfCertificationCourse
      .related('certificationIssueReports')
      .toJSON()
      .map((json) => new CertificationIssueReport(json)),
    complementaryCertificationCourses: bookshelfCertificationCourse
      .related('complementaryCertificationCourses')
      .toJSON()
      .map((json) => new ComplementaryCertificationCourse(json)),
    ..._.pick(dbCertificationCourse, [
      'id',
      'userId',
      'createdAt',
      'completedAt',
      'firstName',
      'lastName',
      'birthplace',
      'birthdate',
      'sex',
      'birthPostalCode',
      'birthINSEECode',
      'birthCountry',
      'sessionId',
      'externalId',
      'isPublished',
      'isV2Certification',
      'hasSeenEndTestScreen',
      'isCancelled',
      'maxReachableLevelOnCertificationDate',
      'verificationCode',
      'abortReason',
    ]),
  });
}

function _adaptModelToDb(certificationCourse) {
  return _.omit(certificationCourse.toDTO(), [
    'complementaryCertificationCourses',
    'certificationIssueReports',
    'assessment',
    'challenges',
    'createdAt',
  ]);
}

function _pickUpdatableProperties(certificationCourse) {
  return _.pick(certificationCourse.toDTO(), [
    'id',
    'isCancelled',
    'birthdate',
    'birthplace',
    'firstName',
    'lastName',
    'sex',
    'birthCountry',
    'birthINSEECode',
    'birthPostalCode',
    'abortReason',
    'completedAt',
  ]);
}
