/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCandidateNotFoundError } from '../../../shared/domain/errors.js';
import { Candidate } from '../../domain/models/Candidate.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.certificationCandidateId
 *
 * @returns {Promise<Candidate | null>}
 */
export async function get({ certificationCandidateId }) {
  const knexConn = DomainTransaction.getConnection();
  const candidateData = await buildBaseReadQuery(knexConn)
    .where({ 'certification-candidates.id': certificationCandidateId })
    .first();

  if (!candidateData) return null;
  return toDomain(candidateData);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 *
 * @returns {Promise<Array<Candidate>>}
 */
export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const candidatesData = await buildBaseReadQuery(knexConn)
    .where({ 'certification-candidates.sessionId': sessionId })
    .orderBy('certification-candidates.id');

  return candidatesData.map(toDomain);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.userId
 *
 * @returns {Promise<Array<Candidate>>}
 */
export async function findByUserId({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const candidatesData = await buildBaseReadQuery(knexConn).where({ 'certification-candidates.userId': userId });
  return candidatesData.map(toDomain);
}

/**
 * @function
 * @param {Candidate} candidate
 *
 * @returns {Promise<void>}
 * @throws {CertificationCandidateNotFoundError} Certification candidate not found
 */
export async function update(candidate) {
  const candidateDataToSave = adaptModelToDb(candidate);
  const knexConn = DomainTransaction.getConnection();

  const [updatedCertificationCandidate] = await knexConn('certification-candidates')
    .where({
      id: candidate.id,
    })
    .update(candidateDataToSave)
    .returning('*');

  if (!updatedCertificationCandidate) {
    throw new CertificationCandidateNotFoundError();
  }
}

/**
 * @function
 * @param {Candidate[]} candidates
 * @returns {Promise<Candidate[]>}
 */
export async function save({ candidates }) {
  const knexConn = DomainTransaction.getConnection();
  const candidatesData = candidates.map(adaptModelToDb);

  const insertedCandidatesData = await knexConn('certification-candidates').insert(candidatesData).returning(['*']);
  const insertedCandidates = [];

  for (const candidate of candidates) {
    const insertedCandidateData = insertedCandidatesData.find(
      (insertedCandidateData) =>
        insertedCandidateData.firstName === candidate.firstName &&
        insertedCandidateData.lastName === candidate.lastName &&
        insertedCandidateData.birthdate === candidate.birthdate,
    );
    insertedCandidates.push(toDomain(insertedCandidateData));
  }

  return insertedCandidates;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 * @returns {Promise<void>}
 */
export async function deleteBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-candidates').where({ sessionId }).del();
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<boolean>}
 */
export async function remove({ id }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-candidates').where({ id }).del();
}

/**
 * @param {import('knex').Knex} knexConn
 * @returns {import('knex').Knex.QueryBuilder}
 */
function buildBaseReadQuery(knexConn) {
  return knexConn('certification-candidates')
    .select('certification-candidates.*', 'certification-courses.id as certificationCourseId')
    .from('certification-candidates')
    .leftJoin('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
    .groupBy('certification-candidates.id', 'certification-courses.id');
}

/**
 * @typedef {object} CandidateDBModel
 * @property {number} userId
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {Date} birthdate
 * @property {string} sex
 * @property {string} birthCity
 * @property {string} birthProvinceCode
 * @property {string} birthCountry
 * @property {number} birthPostalCode
 * @property {number} birthINSEECode
 * @property {string} externalId
 * @property {string} resultRecipientEmail
 * @property {string} billingMode
 * @property {string} prepaymentCode
 * @property {number} organizationLearnerId
 * @property {boolean} authorizedToStart
 * @property {boolean} hasSeenCertificationInstructions
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {number | null} extraTimePercentage
 * @property {Date} reconciledAt
 * @property {string} subscription
 }
 */

/**
 * @function
 * @param {Candidate} candidate
 * @returns {CandidateDBModel}
 */
function adaptModelToDb(candidate) {
  return {
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    sex: candidate.sex,
    birthPostalCode: candidate.birthPostalCode,
    birthINSEECode: candidate.birthINSEECode,
    birthCity: candidate.birthCity,
    birthProvinceCode: candidate.birthProvinceCode,
    birthCountry: candidate.birthCountry,
    email: candidate.email,
    resultRecipientEmail: candidate.resultRecipientEmail,
    externalId: candidate.externalId,
    birthdate: candidate.birthdate,
    extraTimePercentage: candidate.extraTimePercentage,
    authorizedToStart: candidate.authorizedToStart,
    sessionId: candidate.sessionId,
    userId: candidate.userId,
    reconciledAt: candidate.reconciledAt,
    organizationLearnerId: candidate.organizationLearnerId,
    billingMode: candidate.billingMode,
    prepaymentCode: candidate.prepaymentCode,
    hasSeenCertificationInstructions: candidate.hasSeenCertificationInstructions,
    accessibilityAdjustmentNeeded: candidate.accessibilityAdjustmentNeeded,
    subscription: candidate.subscription,
  };
}

/**
 * @typedef {object} CandidateDTO
 * @property {number} id
 * @property {number} userId
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {Date} birthdate
 * @property {string} sex
 * @property {string} birthCity
 * @property {string} birthProvinceCode
 * @property {string} birthCountry
 * @property {number} birthPostalCode
 * @property {number} birthINSEECode
 * @property {string} externalId
 * @property {string} resultRecipientEmail
 * @property {string} billingMode
 * @property {string} prepaymentCode
 * @property {number} organizationLearnerId
 * @property {boolean} authorizedToStart
 * @property {boolean} hasSeenCertificationInstructions
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {boolean} hasStartedTest
 * @property {number | null} extraTimePercentage
 * @property {Date} reconciledAt
 * @property {Date} createdAt
 * @property {string} subscription
 */

/**
 * @function
 * @param {CandidateDTO} candidateData
 * @returns {Candidate}
 */
function toDomain(candidateData) {
  return new Candidate({
    ...candidateData,
    hasStartedTest: Boolean(candidateData.certificationCourseId),
  });
}
