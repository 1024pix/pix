import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { ComplementaryCertificationCourse } from '../../../session-management/domain/models/ComplementaryCertificationCourse.js';
import { CertificationCourse } from '../../domain/models/CertificationCourse.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';

async function save({ certificationCourse }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationCourseToSaveDTO = _adaptModelToDb(certificationCourse);
  const [{ id: certificationCourseId }] = await knexConn('certification-courses')
    .insert(certificationCourseToSaveDTO)
    .returning('id');

  const complementaryCertificationCourse = certificationCourse.toDTO().complementaryCertificationCourse;

  if (complementaryCertificationCourse) {
    await knexConn('complementary-certification-courses').insert({
      ...complementaryCertificationCourse,
      certificationCourseId,
    });
  }

  return get({ id: certificationCourseId });
}

const _findCertificationCourse = async function (id, knexConn) {
  return knexConn('certification-courses').where({ id }).first();
};

const _findAssessment = async function (certificationCourseId, knexConn) {
  return knexConn('assessments').where({ certificationCourseId }).first();
};

const _findAllChallenges = async function (certificationCourseId, knexConn) {
  return knexConn('certification-challenges').where({ courseId: certificationCourseId });
};

async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCourseDTO = await _findCertificationCourse(id, knexConn);

  if (!certificationCourseDTO) {
    throw new NotFoundError(`Certification course of id ${id} does not exist.`);
  }

  const assessmentDTO = await _findAssessment(id, knexConn);

  const certificationIssueReportsDTO = await knexConn('certification-issue-reports').where({
    certificationCourseId: id,
  });

  const complementaryCertificationCourseDTO = await knexConn('complementary-certification-courses')
    .where({
      certificationCourseId: id,
    })
    .first();

  const challengesDTO = await _findAllChallenges(id, knexConn);

  let accessibilityAdjustmentNeeded;
  if (certificationCourseDTO.version === 3) {
    ({ accessibilityAdjustmentNeeded } = await knexConn('certification-candidates')
      .select('accessibilityAdjustmentNeeded')
      .where({
        userId: certificationCourseDTO.userId,
        sessionId: certificationCourseDTO.sessionId,
      })
      .first());
  }

  return _toDomain({
    certificationCourseDTO,
    challengesDTO,
    assessmentDTO,
    complementaryCertificationCourseDTO,
    certificationIssueReportsDTO,
    accessibilityAdjustmentNeeded,
  });
}

function _toDomain({
  certificationCourseDTO,
  challengesDTO = [],
  assessmentDTO = {},
  complementaryCertificationCourseDTO = null,
  certificationIssueReportsDTO = [],
  accessibilityAdjustmentNeeded,
}) {
  const complementaryCertificationCourse = complementaryCertificationCourseDTO
    ? new ComplementaryCertificationCourse(complementaryCertificationCourseDTO)
    : null;

  const certificationIssueReports = certificationIssueReportsDTO.map(
    (certificationIssueReportDTO) => new CertificationIssueReport(certificationIssueReportDTO),
  );

  const assessment = new Assessment(assessmentDTO);

  return new CertificationCourse({
    ...certificationCourseDTO,
    assessment,
    complementaryCertificationCourse,
    certificationIssueReports,
    isAdjustedForAccessibility: accessibilityAdjustmentNeeded,
    nbChallenges: challengesDTO.length,
  });
}

async function getSessionId({ id }) {
  const knexConn = DomainTransaction.getConnection();

  const row = await knexConn('certification-courses').select('sessionId').where({ id }).first();
  if (!row) {
    throw new NotFoundError(`Certification course of id ${id} does not exist`);
  }

  return row.sessionId;
}

async function findOneCertificationCourseByUserIdAndSessionId({ userId, sessionId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationCourseDTO = await knexConn('certification-courses')
    .where({ userId, sessionId })
    .orderBy('createdAt', 'desc')
    .first();

  if (!certificationCourseDTO) {
    return null;
  }

  const assessmentDTO = await _findAssessment(certificationCourseDTO.id, knexConn);

  const challengesDTO = await _findAllChallenges(certificationCourseDTO.id, knexConn);

  return _toDomain({
    certificationCourseDTO,
    challengesDTO,
    assessmentDTO,
    complementaryCertificationCoursesDTO: [],
    certificationIssueReportsDTO: [],
  });
}

/**
 * @param {object} params
 * @param {number} params.userId
 * @returns {Promise<Array<CertificationCourse>>}
 */
async function findAllByUserId({ userId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationCourses = await knexConn('certification-courses')
    .select('*')
    .where({ userId })
    .orderBy('createdAt', 'desc');

  return certificationCourses.map((certificationCourseDTO) => {
    return _toDomain({ certificationCourseDTO });
  });
}

async function update({ certificationCourse }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationCourseData = _extractPropertiesForUpdate(certificationCourse);

  const nbOfUpdatedCertificationCourses = await knexConn('certification-courses')
    .update(certificationCourseData)
    .where({ id: certificationCourseData.id });

  if (nbOfUpdatedCertificationCourses === 0) {
    throw new NotFoundError(`No rows updated for certification course of id ${certificationCourse.getId()}.`);
  }

  return get({ id: certificationCourseData.id });
}

async function isVerificationCodeAvailable({ verificationCode }) {
  const knexConn = DomainTransaction.getConnection();

  const exist = await knexConn('certification-courses')
    .select('id')
    .where('verificationCode', verificationCode)
    .first();

  return !exist;
}

/**
 * @returns {Promise<Array<CertificationCourse>>}
 */
async function findCertificationCoursesBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationCoursesDTO = await knexConn('certification-courses').where({ sessionId });

  return certificationCoursesDTO.map((certificationCourseDTO) => _toDomain({ certificationCourseDTO }));
}

export {
  findAllByUserId,
  findCertificationCoursesBySessionId,
  findOneCertificationCourseByUserIdAndSessionId,
  get,
  getSessionId,
  isVerificationCodeAvailable,
  save,
  update,
};

function _adaptModelToDb(certificationCourse) {
  const certificationCourseDTO = certificationCourse.toDTO();
  return {
    firstName: certificationCourseDTO.firstName,
    lastName: certificationCourseDTO.lastName,
    birthdate: certificationCourseDTO.birthdate,
    birthplace: certificationCourseDTO.birthplace,
    birthPostalCode: certificationCourseDTO.birthPostalCode,
    birthINSEECode: certificationCourseDTO.birthINSEECode,
    birthCountry: certificationCourseDTO.birthCountry,
    sex: certificationCourseDTO.sex,
    externalId: certificationCourseDTO.externalId,
    completedAt: certificationCourseDTO.completedAt,
    isPublished: certificationCourseDTO.isPublished,
    isRejectedForFraud: certificationCourseDTO.isRejectedForFraud,
    verificationCode: certificationCourseDTO.verificationCode,
    userId: certificationCourseDTO.userId,
    sessionId: certificationCourseDTO.sessionId,
    maxReachableLevelOnCertificationDate: certificationCourseDTO.maxReachableLevelOnCertificationDate,
    abortReason: certificationCourseDTO.abortReason,
    version: certificationCourseDTO.version,
    lang: certificationCourseDTO.lang,
    candidateId: certificationCourseDTO.candidateId,
    versionId: certificationCourseDTO.versionId,
    framework: certificationCourseDTO.framework,
  };
}

function _extractPropertiesForUpdate(certificationCourse) {
  const certificationCourseDTO = certificationCourse.toDTO();
  return {
    id: certificationCourseDTO.id,
    birthdate: certificationCourseDTO.birthdate,
    birthplace: certificationCourseDTO.birthplace,
    firstName: certificationCourseDTO.firstName,
    lastName: certificationCourseDTO.lastName,
    updatedAt: new Date(),
    sex: certificationCourseDTO.sex,
    birthCountry: certificationCourseDTO.birthCountry,
    birthINSEECode: certificationCourseDTO.birthINSEECode,
    birthPostalCode: certificationCourseDTO.birthPostalCode,
    abortReason: certificationCourseDTO.abortReason,
    completedAt: certificationCourseDTO.completedAt,
    isRejectedForFraud: certificationCourseDTO.isRejectedForFraud,
  };
}
