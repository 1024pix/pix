import lodash from 'lodash';

const { _ } = lodash;

import { knex } from '../../../../../db/knex-database-connection.js';
import bluebird from 'bluebird';
import { BookshelfCertificationCourse } from '../../../../../lib/infrastructure/orm-models/CertificationCourse.js';
import { BookshelfAssessment } from '../../../../../lib/infrastructure/orm-models/Assessment.js';
import * as bookshelfToDomainConverter from '../../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { CertificationCourse, ComplementaryCertificationCourse } from '../../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import * as certificationChallengeRepository from '../../../../../lib/infrastructure/repositories/certification-challenge-repository.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';
import { Bookshelf } from '../../../../../lib/infrastructure/bookshelf.js';

async function save({ certificationCourse, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || Bookshelf.knex;
  const certificationCourseToSaveDTO = _adaptModelToDb(certificationCourse);
  const options = { transacting: domainTransaction.knexTransaction };
  const savedCertificationCourseDTO = await new BookshelfCertificationCourse(certificationCourseToSaveDTO).save(
    null,
    options,
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

  const savedChallenges = await bluebird.mapSeries(certificationCourse.toDTO().challenges, (certificationChallenge) => {
    const certificationChallengeWithCourseId = {
      ...certificationChallenge,
      courseId: savedCertificationCourseDTO.id,
    };
    return certificationChallengeRepository.save({
      certificationChallenge: certificationChallengeWithCourseId,
      domainTransaction,
    });
  });

  const savedCertificationCourse = toDomain(savedCertificationCourseDTO);
  savedCertificationCourse._challenges = savedChallenges;
  return savedCertificationCourse;
}

async function changeCompletionDate(
  certificationCourseId,
  completedAt = null,
  domainTransaction = DomainTransaction.emptyTransaction(),
) {
  const certificationCourseBookshelf = new BookshelfCertificationCourse({ id: certificationCourseId, completedAt });
  const savedCertificationCourse = await certificationCourseBookshelf.save(null, {
    transacting: domainTransaction.knexTransaction,
  });
  return toDomain(savedCertificationCourse);
}

async function get(id) {
  try {
    const certificationCourseBookshelf = await BookshelfCertificationCourse.where({ id }).fetch({
      withRelated: ['assessment', 'challenges', 'certificationIssueReports', 'complementaryCertificationCourses'],
    });
    return toDomain(certificationCourseBookshelf);
  } catch (bookshelfError) {
    if (bookshelfError instanceof BookshelfCertificationCourse.NotFoundError) {
      throw new NotFoundError(`Certification course of id ${id} does not exist.`);
    }
    throw bookshelfError;
  }
}

async function getCreationDate(id) {
  const row = await knex('certification-courses').select('createdAt').where({ id }).first();
  if (!row) {
    throw new NotFoundError(`Certification course of id ${id} does not exist.`);
  }

  return row.createdAt;
}

async function findOneCertificationCourseByUserIdAndSessionId({
  userId,
  sessionId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const certificationCourse = await BookshelfCertificationCourse.where({ userId, sessionId })
    .orderBy('createdAt', 'desc')
    .fetch({
      require: false,
      withRelated: ['assessment', 'challenges'],
      transacting: domainTransaction.knexTransaction,
    });
  return toDomain(certificationCourse);
}

async function update(certificationCourse) {
  const certificationCourseData = _pickUpdatableProperties(certificationCourse);
  const certificationCourseBookshelf = new BookshelfCertificationCourse(certificationCourseData);
  try {
    const certificationCourse = await certificationCourseBookshelf.save();
    return toDomain(certificationCourse);
  } catch (err) {
    if (err instanceof BookshelfCertificationCourse.NoRowsUpdatedError) {
      throw new NotFoundError(`No rows updated for certification course of id ${certificationCourse.getId()}.`);
    }
    throw err;
  }
}

async function isVerificationCodeAvailable(verificationCode) {
  const exist = await knex('certification-courses')
    .select('id')
    .whereRaw('UPPER(??)=?', ['verificationCode', verificationCode.toUpperCase()])
    .first();

  return !exist;
}

async function findCertificationCoursesBySessionId({ sessionId }) {
  const bookshelfCertificationCourses = await BookshelfCertificationCourse.where({ sessionId }).fetchAll();
  return bookshelfCertificationCourses.map(toDomain);
}

function toDomain(bookshelfCertificationCourse) {
  if (!bookshelfCertificationCourse) {
    return null;
  }

  const assessment = bookshelfToDomainConverter.buildDomainObject(
    BookshelfAssessment,
    bookshelfCertificationCourse.related('assessment'),
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
      'hasSeenEndTestScreen',
      'isCancelled',
      'isRejectedForFraud',
      'maxReachableLevelOnCertificationDate',
      'verificationCode',
      'abortReason',
      'version',
    ]),
  });
}

export {
  save,
  changeCompletionDate,
  get,
  getCreationDate,
  findOneCertificationCourseByUserIdAndSessionId,
  update,
  isVerificationCodeAvailable,
  findCertificationCoursesBySessionId,
  toDomain,
};

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
    'isRejectedForFraud',
  ]);
}
