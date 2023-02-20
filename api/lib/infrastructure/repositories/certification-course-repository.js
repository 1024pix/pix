import { _ } from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import bluebird from 'bluebird';
import CertificationCourseBookshelf from '../orm-models/CertificationCourse';
import AssessmentBookshelf from '../orm-models/Assessment';
import bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter';
import DomainTransaction from '../DomainTransaction';
import CertificationCourse from '../../domain/models/CertificationCourse';
import { NotFoundError } from '../../domain/errors';
import certificationChallengeRepository from './certification-challenge-repository';
import CertificationIssueReport from '../../domain/models/CertificationIssueReport';
import ComplementaryCertificationCourse from '../../domain/models/ComplementaryCertificationCourse';
import Bookshelf from '../bookshelf';

export default {
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
