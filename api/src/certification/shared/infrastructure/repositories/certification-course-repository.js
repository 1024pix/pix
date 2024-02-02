import lodash from 'lodash';

const { _ } = lodash;

import { knex } from '../../../../../db/knex-database-connection.js';
import bluebird from 'bluebird';
import { BookshelfCertificationCourse } from '../../../../../lib/infrastructure/orm-models/CertificationCourse.js';
import { BookshelfAssessment } from '../../../../../lib/infrastructure/orm-models/Assessment.js';
import * as bookshelfToDomainConverter from '../../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  Assessment,
  CertificationCourse,
  ComplementaryCertificationCourse,
} from '../../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import * as certificationChallengeRepository from './certification-challenge-repository.js';
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

  const savedCertificationCourse = bookshelfToDomain(savedCertificationCourseDTO);
  savedCertificationCourse._challenges = savedChallenges;
  return savedCertificationCourse;
}

async function get(id) {
  const certificationCourseDTO = await knex('certification-courses').where({ id }).first();

  if (!certificationCourseDTO) {
    throw new NotFoundError(`Certification course of id ${id} does not exist.`);
  }

  const assessmentDTO = await knex('assessments').where({ certificationCourseId: id }).first();

  const certificationIssueReportsDTO = await knex('certification-issue-reports').where({ certificationCourseId: id });

  const complementaryCertificationCoursesDTO = await knex('complementary-certification-courses').where({
    certificationCourseId: id,
  });

  const challengesDTO = await knex('certification-challenges').where({ courseId: id });

  return _toDomain({
    certificationCourseDTO,
    challengesDTO,
    assessmentDTO,
    complementaryCertificationCoursesDTO,
    certificationIssueReportsDTO,
  });
}

function _toDomain({
  certificationCourseDTO,
  challengesDTO,
  assessmentDTO,
  complementaryCertificationCoursesDTO,
  certificationIssueReportsDTO,
}) {
  const complementaryCertificationCourses = complementaryCertificationCoursesDTO.map(
    (complementaryCertificationCourseDTO) => new ComplementaryCertificationCourse(complementaryCertificationCourseDTO),
  );

  const certificationIssueReports = certificationIssueReportsDTO.map(
    (certificationIssueReportDTO) => new CertificationIssueReport(certificationIssueReportDTO),
  );

  const assessment = new Assessment(assessmentDTO);

  return new CertificationCourse({
    ...certificationCourseDTO,
    assessment,
    challenges: challengesDTO,
    complementaryCertificationCourses,
    certificationIssueReports,
  });
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
  return bookshelfToDomain(certificationCourse);
}

async function update(certificationCourse) {
  const certificationCourseData = _pickUpdatableProperties(certificationCourse);
  const certificationCourseBookshelf = new BookshelfCertificationCourse(certificationCourseData);
  try {
    const certificationCourse = await certificationCourseBookshelf.save();
    return bookshelfToDomain(certificationCourse);
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
  return bookshelfCertificationCourses.map(bookshelfToDomain);
}

function bookshelfToDomain(bookshelfCertificationCourse) {
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
  get,
  findOneCertificationCourseByUserIdAndSessionId,
  update,
  isVerificationCodeAvailable,
  findCertificationCoursesBySessionId,
  bookshelfToDomain,
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
