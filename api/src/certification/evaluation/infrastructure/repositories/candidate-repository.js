// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCandidateNotFoundError } from '../../../shared/domain/errors.js';
import { Candidate } from '../../domain/models/Candidate.js';

/**
 * @typedef {object} CandidateRecord
 * @property {number} id
 * @property {number} userId
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} sex
 * @property {string} birthdate
 * @property {string} birthPostalCode
 * @property {string} birthINSEECode
 * @property {string} birthCountry
 * @property {string} birthCity
 * @property {string} externalId
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {Date} reconciledAt
 * @property {string} subscription
 * @property {boolean} authorizedToStart
 */

/**
 * @function
 * @param {object} params
 * @param {number} params.assessmentId
 * @returns {Promise<Candidate>}
 * @throws {CertificationCandidateNotFoundError}
 */
export async function findByAssessmentId({ assessmentId }) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('certification-candidates')
    .select(
      'certification-candidates.id',
      'certification-candidates.userId',
      'certification-candidates.sessionId',
      'certification-candidates.firstName',
      'certification-candidates.lastName',
      'certification-candidates.sex',
      'certification-candidates.birthdate',
      'certification-candidates.birthPostalCode',
      'certification-candidates.birthINSEECode',
      'certification-candidates.birthCountry',
      'certification-candidates.birthCity',
      'certification-candidates.externalId',
      'certification-candidates.accessibilityAdjustmentNeeded',
      'certification-candidates.reconciledAt',
      'certification-candidates.subscription',
      'certification-candidates.authorizedToStart',
    )
    .join('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .where('assessments.id', assessmentId)
    .first();

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }

  return _toDomain(result);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @returns {Promise<Candidate>}
 * @throws {CertificationCandidateNotFoundError}
 */
export async function findByUserIdAndSessionId({ userId, sessionId }) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('certification-candidates')
    .select(
      'certification-candidates.id',
      'certification-candidates.userId',
      'certification-candidates.sessionId',
      'certification-candidates.firstName',
      'certification-candidates.lastName',
      'certification-candidates.sex',
      'certification-candidates.birthdate',
      'certification-candidates.birthPostalCode',
      'certification-candidates.birthINSEECode',
      'certification-candidates.birthCountry',
      'certification-candidates.birthCity',
      'certification-candidates.externalId',
      'certification-candidates.accessibilityAdjustmentNeeded',
      'certification-candidates.reconciledAt',
      'certification-candidates.subscription',
      'certification-candidates.authorizedToStart',
    )
    .where({ userId, sessionId })
    .first();

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }

  return _toDomain(result);
}

/**
 * @function
 * @param {Candidate} candidate
 *
 * @returns {Promise<void>}
 */
export async function update(candidate) {
  const candidateDataToSave = {
    authorizedToStart: candidate.authorizedToStart,
  };
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-candidates')
    .where({
      id: candidate.id,
    })
    .update(candidateDataToSave)
    .returning('*');
}

/**
 * @function
 * @param {CandidateRecord}
 * @returns {Candidate}
 */
const _toDomain = (data) => {
  return new Candidate({
    ...data,
    subscriptionFramework: data.subscription,
  });
};
