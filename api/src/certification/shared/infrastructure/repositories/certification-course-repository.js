import lodash from 'lodash';

const { _ } = lodash;

import { knex } from '../../../../../db/knex-database-connection.js';
import bluebird from 'bluebird';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  Assessment,
  CertificationCourse,
  ComplementaryCertificationCourse,
} from '../../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import * as certificationChallengeRepository from './certification-challenge-repository.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';
import { config } from '../../../../shared/config.js';

async function save({ certificationCourse, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || knex;

  const certificationCourseToSaveDTO = _adaptModelToDb(certificationCourse);
  const [{ id: certificationCourseId }] = await knexConn('certification-courses')
    .insert(certificationCourseToSaveDTO)
    .returning('id');

  const complementaryCertificationCourses = certificationCourse
    .toDTO()
    .complementaryCertificationCourses.map(({ complementaryCertificationId, complementaryCertificationBadgeId }) => ({
      complementaryCertificationId,
      complementaryCertificationBadgeId,
      certificationCourseId,
    }));

  if (!_.isEmpty(complementaryCertificationCourses)) {
    await knexConn('complementary-certification-courses').insert(complementaryCertificationCourses);
  }

  await bluebird.mapSeries(certificationCourse.toDTO().challenges, (certificationChallenge) => {
    const certificationChallengeWithCourseId = {
      ...certificationChallenge,
      courseId: certificationCourseId,
    };
    return certificationChallengeRepository.save({
      certificationChallenge: certificationChallengeWithCourseId,
      domainTransaction,
    });
  });

  return get(certificationCourseId, domainTransaction);
}

const _findCertificationCourse = async function (id, knexConn = knex) {
  return knexConn('certification-courses').where({ id }).first();
};

const _findAssessment = async function (certificationCourseId, knexConn = knex) {
  return knexConn('assessments').where({ certificationCourseId }).first();
};

const _findAllChallenges = async function (certificationCourseId, knexConn = knex) {
  return knexConn('certification-challenges').where({ courseId: certificationCourseId });
};

async function get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const certificationCourseDTO = await _findCertificationCourse(id, knexConn);

  if (!certificationCourseDTO) {
    throw new NotFoundError(`Certification course of id ${id} does not exist.`);
  }

  const assessmentDTO = await _findAssessment(id, knexConn);

  const certificationIssueReportsDTO = await knexConn('certification-issue-reports').where({
    certificationCourseId: id,
  });

  const complementaryCertificationCoursesDTO = await knexConn('complementary-certification-courses').where({
    certificationCourseId: id,
  });

  const challengesDTO = await _findAllChallenges(id, knexConn);

  if (certificationCourseDTO.version === 3) {
    const configuration = await knexConn('flash-algorithm-configurations')
      .where('createdAt', '<=', certificationCourseDTO.createdAt)
      .orderBy('createdAt', 'desc')
      .first();

    certificationCourseDTO.numberOfChallenges =
      configuration?.maximumAssessmentLength ?? config.v3Certification.numberOfChallengesPerCourse;
  }

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
  challengesDTO = [],
  assessmentDTO = {},
  complementaryCertificationCoursesDTO = [],
  certificationIssueReportsDTO = [],
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

async function getSessionId(id) {
  const row = await knex('certification-courses').select('sessionId').where({ id }).first();
  if (!row) {
    throw new NotFoundError(`Certification course of id ${id} does not exist`);
  }

  return row.sessionId;
}

async function findOneCertificationCourseByUserIdAndSessionId({
  userId,
  sessionId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction ?? knex;

  const certificationCourseDto = await knexConn('certification-courses')
    .where({ userId, sessionId })
    .orderBy('createdAt', 'desc')
    .first();

  if (!certificationCourseDto) {
    return null;
  }

  const assessmentDTO = await _findAssessment(certificationCourseDto.id, knexConn);

  const challengesDTO = await _findAllChallenges(certificationCourseDto.id, knexConn);

  return _toDomain({
    certificationCourseDTO: certificationCourseDto,
    challengesDTO,
    assessmentDTO,
    complementaryCertificationCoursesDTO: [],
    certificationIssueReportsDTO: [],
  });
}

async function update(certificationCourse) {
  const knexConn = knex;

  const certificationCourseData = _pickUpdatableProperties(certificationCourse);

  const nbOfUpdatedCertificationCourses = await knexConn('certification-courses')
    .update(certificationCourseData)
    .where({ id: certificationCourseData.id });

  if (nbOfUpdatedCertificationCourses === 0) {
    throw new NotFoundError(`No rows updated for certification course of id ${certificationCourse.getId()}.`);
  }

  return get(certificationCourseData.id);
}

async function isVerificationCodeAvailable(verificationCode) {
  const exist = await knex('certification-courses')
    .select('id')
    .whereRaw('UPPER(??)=?', ['verificationCode', verificationCode.toUpperCase()])
    .first();

  return !exist;
}

async function findCertificationCoursesBySessionId({ sessionId }) {
  const certificationCoursesDTO = await knex('certification-courses').where({ sessionId });

  return certificationCoursesDTO.map((certificationCourseDTO) => _toDomain({ certificationCourseDTO }));
}

export {
  save,
  get,
  getSessionId,
  findOneCertificationCourseByUserIdAndSessionId,
  update,
  isVerificationCodeAvailable,
  findCertificationCoursesBySessionId,
};

function _adaptModelToDb(certificationCourse) {
  return _.omit(certificationCourse.toDTO(), [
    'complementaryCertificationCourses',
    'certificationIssueReports',
    'assessment',
    'challenges',
    'createdAt',
    'numberOfChallenges',
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
